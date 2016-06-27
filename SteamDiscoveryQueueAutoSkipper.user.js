// ==UserScript==
// @author      PotcFdk
// @name        Steam Discovery Queue Auto-Skipper
// @namespace   https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper
// @description Auto-clicks the "Next in Queue" button in Steam Discovery Queues.
// @include     http://store.steampowered.com/app/*
// @include     https://store.steampowered.com/app/*
// @include     http://store.steampowered.com/agecheck/app/*
// @include     https://store.steampowered.com/agecheck/app/*
// @include     http://store.steampowered.com/explore*
// @include     https://store.steampowered.com/explore*
// @version     0.5.0
// @grant       none
// @downloadURL https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.user.js
// @updateURL   https://raw.githubusercontent.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/master/SteamDiscoveryQueueAutoSkipper.meta.js
// ==/UserScript==

/*
	Steam Discovery Queue Auto-Skipper - Copyright (c) PotcFdk, 2015

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

// Handle error pages

var page = document.getElementsByTagName("BODY")[0].innerHTML;

if (page.length < 100
	|| page.includes ("An error occurred while processing your request")
	|| page.includes ("The Steam Store is experiencing some heavy load right now"))
{
	location.reload();
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

// Main queue-skipper

function handleQueuePage()
{
	function nextInQueueButton()
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
			click (btn);
		}
	}

	var ajax_failures = 0;
	
	function ajax()
	{
		var next_in_queue_form = document.getElementById("next_in_queue_form");
		var xhr = new XMLHttpRequest();
		xhr.responseType = "document";
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				var _2_next_in_queue_form = xhr.response.getElementById("next_in_queue_form");
				if (_2_next_in_queue_form && _2_next_in_queue_form.length)
				{
					next_in_queue_form.parentNode.innerHTML = _2_next_in_queue_form.parentNode.innerHTML;
					handleQueuePage();
				}
				else
				{
					location.href = next_in_queue_form.getAttribute("action");
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
		form.append("sessionid", next_in_queue_form.sessionid.value);
		form.append("appid_to_clear_from_queue", next_in_queue_form.appid_to_clear_from_queue.value);
		form.append("snr", next_in_queue_form.snr.value);
		
		xhr.send(form);
	}
	
	ajax();
}

if (document.getElementsByClassName ("btn_next_in_queue").length)
{
	handleQueuePage();
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
			if (btn_medium[i].textContent.includes ("Continue"))
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
	if (DoAgeGateSubmit)
	{
		DoAgeGateSubmit();
	}
}

var refresh_queue_btn = document.getElementById ("refresh_queue_btn");
if (refresh_queue_btn && (Number (document.getElementsByClassName ('subtext')[0].innerHTML.substring(12,13)) >= 1))
{
	click (refresh_queue_btn);
}
