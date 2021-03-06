// ==UserScript==
// @author      PotcFdk
// @name        Steam Discovery Queue Auto-Skipper
// @namespace   https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper
// @description Auto-clicks the "Next in Queue" button in Steam Discovery Queues.
// @match       *://store.steampowered.com/
// @match       *://store.steampowered.com/app/*
// @match       *://store.steampowered.com/agecheck/app/*
// @match       *://store.steampowered.com/explore*
// @match       *://store.steampowered.com/points*
// @version     0.10.0
// @grant       none
// @icon        https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/logo.png
// @downloadURL https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.user.js
// @updateURL   https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.meta.js
// ==/UserScript==

/*
	Steam Discovery Queue Auto-Skipper - Copyright (c) PotcFdk, 2015 - 2020
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

// (0) Handle error pages

var page = document.getElementsByTagName("BODY")[0].innerHTML;

if (page.length < 100
	|| page.includes ("An error occurred while processing your request")
	|| page.includes ("The Steam Store is experiencing some heavy load right now"))
{
	location.reload();
	return;
}

// Click helper

function click (obj)
{
	var evObj = new MouseEvent ('click');
	obj.dispatchEvent (evObj);

	window.addEventListener ('load', function() {
		click (obj);
	});
}

// (1) Main queue-skipper

function handleQueuePage()
{
	var btn = document.getElementsByClassName ("btn_next_in_queue")[0];

	if (btn)
	{
		var btn_text = btn.getElementsByTagName ("span")[0];
		var btn_subtext = document.getElementsByClassName ("queue_sub_text")[0];
		if (btn_text)
		{
			if (btn_subtext)
			{
				btn_text.textContent = "Loading next item...";
				btn_text.appendChild (document.createElement ("br"));
				btn_text.appendChild (btn_subtext);
			}
			else
			{
				btn_text.textContent = "Finishing Queue...";
			}
		}
	}

	function nextInQueueButton()
	{
		if (btn)
		{
			click (btn);
		}
	}

	var ajax_failures = 0;

	function ajax()
	{
		var next_in_queue_form = document.getElementById ("next_in_queue_form");
		var xhr = new XMLHttpRequest();
		xhr.responseType = "document";
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				var _2_next_in_queue_form = xhr.response.getElementById ("next_in_queue_form");
				if (_2_next_in_queue_form && _2_next_in_queue_form.length)
				{
					next_in_queue_form.parentNode.innerHTML = _2_next_in_queue_form.parentNode.innerHTML;
					handleQueuePage();
				}
				else
				{
					location.href = next_in_queue_form.getAttribute ("action");
				}
			}
			else if (xhr.readyState == 4)
			{
				if (ajax_failures++ < 3)
				{
					console.log ("Failed AJAX (HTTP status " + xhr.status + "). Retrying (" + ajax_failures + "/3)...");
					ajax();
				}
				else
				{
					console.log ("Failed AJAX (HTTP status " + xhr.status + "). Retrying using the classic button click method...");
					nextInQueueButton();
				}
			}
		};
		xhr.open("POST", next_in_queue_form.getAttribute("action"), true);

		var form = new FormData();
		form.append ("sessionid", next_in_queue_form.sessionid.value);
		form.append ("appid_to_clear_from_queue", next_in_queue_form.appid_to_clear_from_queue.value);
		form.append ("snr", next_in_queue_form.snr.value);

		xhr.send (form);
	}

	ajax();
}

if (document.getElementsByClassName ("btn_next_in_queue").length)
{
	handleQueuePage();
	return;
}

// Automate agegate #1

var app_agegate = document.getElementById ("app_agegate");
if (app_agegate)
{
	var btn_medium = app_agegate.getElementsByClassName ("btn_medium");
	if (btn_medium)
	{
		for (i = 0; i < btn_medium.length; i++)
		{
			var onclick = btn_medium[i].getAttribute("onclick");
			if (onclick && onclick.includes("HideAgeGate"))
			{
				click (btn_medium[i]);
			}
		}
	}
}

// Automate agegate #2

var ageYear = document.getElementById ("ageYear");
if (ageYear)
{
	ageYear.value = 1985;
	if (typeof DoAgeGateSubmit == "function")
	{
		DoAgeGateSubmit();
	}
	else if (typeof ViewProductPage == "function")
	{
		ViewProductPage();
	}
}

// Multiple queues helper

function getQueueCount (doc) {
	var _subtext = doc.getElementsByClassName('subtext')[0];
	if (_subtext) {
		var queue_count_subtext = _subtext.innerHTML;
		var queue_count = parseInt(queue_count_subtext.replace(/[^0-9\.]/g, ''), 10);
		if (isNaN(queue_count))
		{
			var language = doc.documentElement.getAttribute("lang");
			switch(language)
			{
				case "de":
					queue_count = queue_count_subtext.includes(" eine ") ? 1 : 0;
					break;
				case "fr":
					queue_count = queue_count_subtext.includes(" une ") ? 1 : 0;
					break;
				case "it":
					queue_count = queue_count_subtext.includes(" un'altra ") ? 1 : 0;
					break;
				case "pl":
					queue_count = queue_count_subtext.includes(" jedną ") ? 1 : 0;
					break;
				case "ru":
				case "uk":
					queue_count = queue_count_subtext.includes(" одну ") ? 1 : 0;
					break;
				default:
					queue_count = 0;
			}
		}
	}
	return queue_count;
}

// (2) Multiple queues trigger
const refresh_queue_btn = document.getElementById ("refresh_queue_btn");

if (refresh_queue_btn && (getQueueCount (document) >= 1))
{
	click (refresh_queue_btn);
}

// (3) Queue check and notification
else if (Date.now() - (localStorage.SteamDiscoveryQueueAutoSkipper_lastchecked || 0) > 60*60*1000) { // 1 hour
	fetch('https://store.steampowered.com/explore/', {credentials: 'include'}).then(r =>r.text().then(body => {
		const doc = new DOMParser().parseFromString(body, "text/html");
		if (getQueueCount (doc) > 0)
			ShowConfirmDialog ('SteamDiscoveryQueueAutoSkipper',
								'You seem to have remaining unlockable trading cards in your discovery queue!\n'
								+ 'Do you want to start auto-exploring the queue now?',
								'Yes!', 'No, remind me later.').done (function () {
				location.href = 'https://store.steampowered.com/explore/startnew';
			});
		else
			console.log ("Queue count is 0");
		localStorage.SteamDiscoveryQueueAutoSkipper_lastchecked = Date.now();
	}));
}

// Legacy Cleanup

// ItemRewards (2020 Winter Sale, v0.9)
if (typeof localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time != "undefined") {
	delete localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time;
}
