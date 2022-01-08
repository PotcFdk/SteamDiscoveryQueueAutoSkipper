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
// @version     0.12.0
// @grant       none
// @icon        https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/logo.png
// @downloadURL https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.user.js
// @updateURL   https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.meta.js
// ==/UserScript==

/*
	Steam Discovery Queue Auto-Skipper - Copyright (c) PotcFdk, 2015 - 2022
	Project logo donated to the project by krys (krys#4143), 2020
	Edits by: Ni1kko (Ni1kko#1652), 2022

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


const HOUR = 60*60*1000;

//-- Login detection helper
const hasLoginLink = () => Array.from(document.getElementsByClassName("global_action_link")).filter(a => a.href).filter(a => a.href.includes("login")).length > 0;
const hasAccountLink = () => Array.from(document.getElementsByClassName("global_action_link")).filter(a => a.href).filter(a => a.href.includes("account")).length > 0;
const isLoggedIn =  () => !hasLoginLink() &&  hasAccountLink();
const isLoggedOut = () =>  hasLoginLink() && !hasAccountLink();

//-- Click helper
function click (obj)
{
	var evObj = new MouseEvent ('click');
	obj.dispatchEvent (evObj);

	window.addEventListener ('load', function() {
		click (obj);
	});
}

//-- Sleep helper
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

//-- Popup closer
async function no_popup() {
	while (document.location.pathname =="/explore/") { 
		if(document.getElementsByClassName('btn_grey_steamui').length == 1){
			await sleep(10 * 1000);
			if(document.getElementsByClassName('btn_grey_steamui').length == 1){ 
				console.log('Closing popup');
				click (document.getElementsByClassName('btn_grey_steamui')[0]);
			};
			await init();
		};
		//console.log('popup check loop');
		await sleep(5 * 1000);
	}
}

//-- Main queue-skipper
function handleQueuePage()
{
	//-- Automate agegate #1
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

	//-- Automate agegate #2
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

	//-- Add to wishlist
	var category_icons = document.getElementsByClassName('category_icon');
    if (category_icons) {
        var is_free = false;
        var is_dlc = false;
        
        var btn_addtocart = document.getElementsByClassName('btn_addtocart');
        if (btn_addtocart) {
            for (var j=0; j < btn_addtocart.length; j++) {
                if (btn_addtocart[j].firstElementChild) {
                    if (btn_addtocart[j].firstElementChild.href && btn_addtocart[j].firstElementChild.href.match('steam://run/')) {
                        is_free = true;
                        break;
                    }
                }
            }
        }

        for (var i=0; i < category_icons.length; i++) {
            if (category_icons[i].src && category_icons[i].src.match('ico_dlc')) {
                is_dlc = true;
                break;
            }
        }
		
        if (!is_free && !is_dlc) {
            var wishlist_area = document.getElementById('add_to_wishlist_area');
            if (wishlist_area && wishlist_area.firstElementChild && wishlist_area.firstElementChild.href && wishlist_area.firstElementChild.href != '' && wishlist_area.firstElementChild.href.indexOf('javascript:AddToWishlist(') === 0) 
			{
                var didadd = false;

				try {
					//console.log('Adding product to Wishlist.');
                    wishlist_area.firstElementChild.click();
                    document.getElementsByClassName('queue_btn_active')[0].style.border ='1px solid #999999';
					didadd = true;
                } catch (err) {
					didadd = false;
                }
					
				if(didadd){
					console.log('Product added to Wishlist.');
				}else{
					console.log('Error adding product to Wishlist.');
				}
            } else {
                console.log('Product is already on your Wishlist.');
            }
        } else {
            console.log(is_free ? 'Product is free, skipping!' : 'Product is dlc, skipping!');
        };
    }

	//-- Next queue item
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

//-- Multiple queues helper
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

//-- ItemRewards helper
function claim_sale_reward (webapi_token) {
	return fetch("https://api.steampowered.com/ISaleItemRewardsService/ClaimItem/v1?access_token=" + webapi_token, {
		"credentials": "omit",
		"headers": {
			"Content-Type": "multipart/form-data; boundary=---------------------------90594386426341336747734585788"
		},
		"referrer": "https://store.steampowered.com/points/shop",
		"body": "-----------------------------90594386426341336747734585788\r\nContent-Disposition: form-data; name=\"input_protobuf_encoded\"\r\n\r\n\r\n-----------------------------90594386426341336747734585788--\r\n",
		"method": "POST",
		"mode": "cors"
	});
}

//-- Main function
async function init() 
{ 
	// Handle error pages
	var page = document.getElementsByTagName("BODY")[0].innerHTML;
	if (page.length < 100 || page.includes ("An error occurred while processing your request")|| page.includes ("The Steam Store is experiencing some heavy load right now"))
	{
		location.reload();
		return;
	}
	// Purge existing timestamps when not logged in
	if (isLoggedOut()) 
	{
		delete localStorage.SteamDiscoveryQueueAutoSkipper_lastchecked;
		delete localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time;
	}

	//-- Start Queue
	var refresh_queue_btn = document.getElementById ("refresh_queue_btn");
	if (refresh_queue_btn/* && (getQueueCount (document) >= 1)*/)
	{
		console.log('Starting in 5 secs');
		await sleep(5 * 1000);

		console.log('Loading new queue');
		click (refresh_queue_btn);
		no_popup();
	}
	else if (document.getElementsByClassName ("btn_next_in_queue").length)
	{
		//-- Next Queue Item
		handleQueuePage();
		return;
	}
	else if (isLoggedIn() && (Date.now() - (localStorage.SteamDiscoveryQueueAutoSkipper_lastchecked || 0) > HOUR)) 
	{// Queue check and notification
		fetch('https://store.steampowered.com/explore/', {credentials: 'include'}).then(r =>r.text().then(body => {
			var doc = new DOMParser().parseFromString(body, "text/html");
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
	else if (isLoggedIn() && (Date.now() - (localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time || 0) > 0)) 
	{	// ItemRewards check and background execution
		fetch ('https://store.steampowered.com/points/shop', {credentials: 'include'}).then(r =>r.text().then(body => {
			localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time = Date.now() + HOUR;

			var doc = new DOMParser().parseFromString(body, "text/html");
			var application_config = doc.getElementById('application_config');
			var data_loyaltystore = JSON.parse(application_config.getAttribute('data-loyaltystore'));
			var webapi_token = data_loyaltystore.webapi_token;
			if (data_loyaltystore.can_claim_sale_reward.can_claim == 1) {
				console.log("Claiming freesticker...");
				claim_sale_reward (webapi_token).then (() => {
					ShowConfirmDialog ('SteamDiscoveryQueueAutoSkipper',
									'Auto-claimed a free sticker! Do you want to check your inventory now?',
									'Yes!', 'No.').done (function () {
						location.href = 'https://steamcommunity.com/my/inventory';
					});
				});
			} else if (typeof data_loyaltystore.can_claim_sale_reward.next_claim_time == "number") {
				console.log (`Setting freesticker_next_claim_time to ${data_loyaltystore.can_claim_sale_reward.next_claim_time}`)
				localStorage.SteamDiscoveryQueueAutoSkipper_freesticker_next_claim_time = data_loyaltystore.can_claim_sale_reward.next_claim_time*1000;
			}
		}));
	}

}

//-- Start point 
console.log('Steam Discovery Queue Auto-Skipper');
init();