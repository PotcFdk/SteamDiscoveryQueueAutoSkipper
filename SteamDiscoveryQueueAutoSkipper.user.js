// ==UserScript==
// @author      PotcFdk
// @name        Steam Discovery Queue Auto-Skipper
// @namespace   https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper
// @description Auto-clicks the "Next in Queue" button in Steam Discovery Queues.
// @match       *://store.steampowered.com/*
// @match       *://store.steampowered.com/app/*
// @match       *://store.steampowered.com/agecheck/app/*
// @match       *://store.steampowered.com/explore*
// @match       *://store.steampowered.com/points*
// @version     1.0.0
// @grant       none
// @icon        https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/logo.png
// @downloadURL https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.user.js
// @updateURL   https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.meta.js
// @require     https://cdn.jsdelivr.net/npm/protobufjs@7.1.2/dist/protobuf.js#sha256-6ae1445115d49dac60b8a69e37bd3a2eb6e42120d75f22879a9286b7061608ec
// @homepageURL https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper
// @supportURL  https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/issues
// ==/UserScript==

/*
	Steam Discovery Queue Auto-Skipper - Copyright (c) PotcFdk, 2015 - 2023
	Project logo donated to the project by krys (krys#4143), 2020

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

const CONSTANTS = {
	HOUR: 60*60*1000
};

const STATE = {};

const SETUP = [
	function () {
		let styleBg = '', styleAppendix = '';
		switch ((new Date()).getMonth())
		{
			case 11:
				styleBg =
					`background-size: 424px;
					background-image: repeating-linear-gradient(45deg, #ff0000, #af0000 13px, #1d6a00 6px, #1d4a00 30px);
					animation: moveGradient 5s linear infinite;`;
				styleAppendix =
					`@keyframes moveGradient {
						0% {
							background-position: 0 0; /* Start position */
						}
						100% {
							background-position: -424px 0; /* End position */
						}
					}`;
				break;
			default:
				styleBg =
					'background-color: #ffcc6a;';
		}

		const style = document.createElement('style');
		style.innerHTML = `#queueActionsCtn::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 0px;
			transition: width 1s ease 0s;
			height: 100%;
			${styleBg}
		}
		${styleAppendix}`;
		document.getElementsByTagName('head')[0].appendChild(style);

		STATE.loadingBarAfterStyle = Array.from(style.sheet.cssRules).filter(rule => rule.selectorText === '#queueActionsCtn::after').map(rule => rule.style)[0];
	},
	function () {
		STATE.queueCountTotal = Number(document.getElementsByClassName('queue_sub_text')[0]?.textContent.match(/\d+/)[0] || 0);
	}
];

const HELPERS = {
	click: (obj) =>	{
		var evObj = new MouseEvent('click');
		obj.dispatchEvent(evObj);
	
		window.addEventListener('load', function () {
			HELPERS.click(obj);
		});
	},

	hasLoginLink: () =>
		Array.from(document.getElementsByClassName('global_action_link'))
			.filter(a => a.href)
			.filter(a => a.href
				.includes('login')).length > 0,

	hasAvatarClassElements: () => document.getElementsByClassName('playerAvatar').length > 0,

	isLoggedIn:  () => !HELPERS.hasLoginLink() &&  HELPERS.hasAvatarClassElements(),
	isLoggedOut: () =>  HELPERS.hasLoginLink() && !HELPERS.hasAvatarClassElements(),
	
	getQueueCount: (doc) => {
		const _subtext = doc.getElementsByClassName('subtext')[0];
		if (_subtext) {
			const queue_count_subtext = _subtext.innerHTML;
			let queue_count = parseInt(queue_count_subtext.replace(/[^0-9.]/g, ''), 10);
			if (isNaN(queue_count))
			{
				const language = doc.documentElement.getAttribute('lang');
				switch(language)
				{
					case 'de':
						queue_count = queue_count_subtext.includes(' eine ') ? 1 : 0;
						break;
					case 'fr':
						queue_count = queue_count_subtext.includes(' une ') ? 1 : 0;
						break;
					case 'it':
						queue_count = queue_count_subtext.includes(" un'altra ") ? 1 : 0;
						break;
					case 'pl':
						queue_count = queue_count_subtext.includes(' jedną ') ? 1 : 0;
						break;
					case 'ru':
					case 'uk':
						queue_count = queue_count_subtext.includes(' одну ') ? 1 : 0;
						break;
					default:
						queue_count = 0;
				}
			}
			return queue_count;
		}
	},

	claim_sale_reward: (webapi_token) => {
		return fetch('https://api.steampowered.com/ISaleItemRewardsService/ClaimItem/v1?access_token=' + webapi_token, {
			'credentials': 'omit',
			'headers': {
				'Content-Type': 'multipart/form-data; boundary=---------------------------90594386426341336747734585788'
			},
			'referrer': 'https://store.steampowered.com/points/shop',
			'body': '-----------------------------90594386426341336747734585788\r\nContent-Disposition: form-data; name="input_protobuf_encoded"\r\n\r\n\r\n-----------------------------90594386426341336747734585788--\r\n',
			'method': 'POST',
			'mode': 'cors'
		});
	},

	setLoadingBarProgress: (percent) => {
		if (STATE.loadingBarAfterStyle && isFinite(percent))
			STATE.loadingBarAfterStyle.width = Math.floor(Math.max(0, Math.min(100, percent))) + '%';
	},

	handleQueuePage: () => {
		const queueCountRemaining = Number(document.getElementsByClassName('queue_sub_text')[0]?.textContent.match(/\d+/)[0] || 0);
		const progress = 100 * (STATE.queueCountTotal - queueCountRemaining) / STATE.queueCountTotal;
		HELPERS.setLoadingBarProgress(progress);

		var btn = document.getElementsByClassName('btn_next_in_queue')[0];

		if (btn)
		{
			var btn_text = btn.getElementsByTagName('span')[0];
			var btn_subtext = document.getElementsByClassName('queue_sub_text')[0];
			if (btn_text)
			{
				if (btn_subtext)
				{
					btn_text.textContent = 'Loading next item...';
					btn_text.appendChild(document.createElement('br'));
					btn_text.appendChild(btn_subtext);
				}
				else
				{
					btn_text.textContent = 'Finishing Queue...';
				}
			}
		}

		var ajax_failures = 0;

		function ajax ()
		{
			var next_in_queue_form = document.getElementById('next_in_queue_form');
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'document';
			xhr.onreadystatechange = function ()
			{
				if (xhr.readyState === 4 && xhr.status === 200)
				{
					var _2_next_in_queue_form = xhr.response.getElementById('next_in_queue_form');
					if (_2_next_in_queue_form && _2_next_in_queue_form.length)
					{
						next_in_queue_form.parentNode.innerHTML = _2_next_in_queue_form.parentNode.innerHTML;
						HELPERS.handleQueuePage();
					}
					else
					{
						location.href = next_in_queue_form.getAttribute('action');
					}
				}
				else if (xhr.readyState === 4)
				{
					if (ajax_failures++ < 3)
					{
						console.log('Failed AJAX (HTTP status ' + xhr.status + '). Retrying (' + ajax_failures + '/3)...');
						ajax();
					}
					else
					{
						console.log('Failed AJAX (HTTP status ' + xhr.status + '). Retrying using the classic button click method...');
						if (btn)
							HELPERS.click(btn);
					}
				}
			};
			xhr.open('POST', next_in_queue_form.getAttribute('action'), true);

			var form = new FormData();
			form.append('sessionid', next_in_queue_form.sessionid.value);
			form.append('appid_to_clear_from_queue', next_in_queue_form.appid_to_clear_from_queue.value);
			form.append('snr', next_in_queue_form.snr.value);

			xhr.send(form);
		}

		ajax();
	}
};

const HandlerResult = Object.freeze({
	next: Symbol('next'),
	abort: Symbol('abort')
});

const HANDLERS = [
	['errorPage', () => {
		const page = document.getElementsByTagName('BODY')[0].innerHTML;

		if (page.length < 100
			|| page.includes('An error occurred while processing your request')
			|| page.includes('The Steam Store is experiencing some heavy load right now'))
		{
			location.reload();
			return HandlerResult.abort;
		}		
	}],

	['ageGate1', () => {
		const app_agegate = document.getElementById('app_agegate');
		if (app_agegate)
		{
			const btn_medium = app_agegate.getElementsByClassName('btn_medium');
			if (btn_medium)
			{
				for (let i = 0; i < btn_medium.length; i++)
				{
					const onclick = btn_medium[i].getAttribute('onclick');
					if (onclick && onclick.includes('HideAgeGate'))
					{
						HELPERS.click(btn_medium[i]);
						return HandlerResult.abort;
					}
				}
			}
		}
	}],

	['ageGate2', () => {
		const ageYear = document.getElementById('ageYear');
		if (ageYear)
		{
			ageYear.value = 1985;
			if (typeof DoAgeGateSubmit === 'function')
			{
				DoAgeGateSubmit();
				return HandlerResult.abort;
			}
			else if (typeof ViewProductPage === 'function')
			{
				ViewProductPage();
				return HandlerResult.abort;
			}
		}
	}],

	['loggedOutCleanup', () => {
		if (HELPERS.isLoggedOut()) {
			delete localStorage.SteamDiscoveryQueueAutoSkipper_lastchecked;
			delete localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time;
			return HandlerResult.abort;
		}
	}],

	['discoveryQueue', () => {
		if (document.getElementsByClassName('btn_next_in_queue').length) {
			HELPERS.handleQueuePage();
			return HandlerResult.abort;
		}
	}],

	['multiDiscoveryQueueTrigger', () => {
		const refresh_queue_btn = document.getElementById('refresh_queue_btn');
		if (refresh_queue_btn && (HELPERS.getQueueCount(document) >= 1)) {
			HELPERS.click(refresh_queue_btn);
			return HandlerResult.abort;
		}
	}],

	['discoveryQueueDetectAndPrompt', () => {
		if (HELPERS.isLoggedIn() && (Date.now() - (localStorage.SteamDiscoveryQueueAutoSkipper_lastchecked || 0) > CONSTANTS.HOUR)) {
			fetch('https://store.steampowered.com/explore/', {credentials: 'include'}).then(r =>r.text().then(body => {
				const doc = new DOMParser().parseFromString(body, 'text/html');
				if (HELPERS.getQueueCount(doc) > 0)
					ShowConfirmDialog('SteamDiscoveryQueueAutoSkipper',
						'You seem to have remaining unlockable trading cards in your discovery queue!\n'
										+ 'Do you want to start auto-exploring the queue now?',
						'Yes!', 'No, remind me later.').done(function () {
						location.href = 'https://store.steampowered.com/explore/startnew';
					});
				else
					console.log('Queue count is 0');
		
				localStorage.SteamDiscoveryQueueAutoSkipper_lastchecked = Date.now();
			}));
			return HandlerResult.abort;
		}
	}],

	['itemRewards', () => {
		if (HELPERS.isLoggedIn() && (Date.now() - (localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time || 0) > 0)) {
			// I hope this is at least somewhat correct. At least it feels OK, so that means we're probably halfway there.
			const ItemRewardProtos = 'syntax="proto3";\
			  message CanClaimItemResponse {\
				bool can_claim = 1;\
				int32 next_claim_time = 2;\
			  }';
			const ItemRewardProtoRoot = protobuf.parse(ItemRewardProtos, { keepCase: true }).root;
			const CanClaimItemResponse = ItemRewardProtoRoot.lookup('CanClaimItemResponse');

			// First let's fetch one of the offer pages that we can grab the webapi token from.
			fetch('https://store.steampowered.com/greatondeck', { credentials: 'include' }).then(r => r.text().then(body => {
				localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time = Date.now() + CONSTANTS.HOUR;

				const doc = new DOMParser().parseFromString(body, 'text/html');
				const application_config = doc.getElementById('application_config');
				const webapi_token = JSON.parse(application_config.getAttribute('data-loyalty_webapi_token')); // There it is!

				// Now let's actually ask the ISaleItemRewardsService if we can claim the item.
				fetch(`https://api.steampowered.com/ISaleItemRewardsService/CanClaimItem/v1?access_token=${webapi_token}&origin=https:%2F%2Fstore.steampowered.com&input_protobuf_encoded=CgdlbmdsaXNo`, {
					credentials: 'omit',
					mode: 'cors'
				}).then(r => r.arrayBuffer().then(body => {
					const response = CanClaimItemResponse.decode(new Uint8Array(body));

					if (response.can_claim) {
						console.log('Claiming freesticker...');
						HELPERS.claim_sale_reward(webapi_token).then(() => {
							ShowConfirmDialog('SteamDiscoveryQueueAutoSkipper',
								'Auto-claimed a free sticker! Do you want to check your inventory now?',
								'Yes!', 'No.').done(function () {
								location.href = 'https://steamcommunity.com/my/inventory';
							});
						});
					} else if (typeof response.next_claim_time === 'number') {
						console.log(`Setting freesticker_next_claim_time to ${response.next_claim_time}`);
						localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time = response.next_claim_time * 1000;
					}
				}));
			}));
			return HandlerResult.abort;
		}
	}]
];

/// RUN

// 1. Setup
SETUP.forEach((func, idx) => {
	console.log(`SETUP #${idx}...`);
	func();
});

// 2. Handlers
for (let idx = 0; idx < HANDLERS.length; ++idx) {
	const handler = HANDLERS[idx];
	const result = handler[1]();
	console.log(`Handler #${idx} / ${handler[0]} -> ${typeof result === 'symbol' ? result.toString() : result}`);
	
	if (result === HandlerResult.abort) {
		break;
	} else {
		continue;
	}
}
