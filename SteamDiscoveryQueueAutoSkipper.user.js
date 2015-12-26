// ==UserScript==
// @author      PotcFdk
// @name        Steam Discovery Queue Auto-Skipper
// @namespace   https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper
// @description Auto-clicks the "Next in Queue" button in Steam Discovery Queues.
// @include     http://store.steampowered.com/app/*
// @include     https://store.steampowered.com/app/*
// @version     0.0.3
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

// Is there a "Next in Queue" button?

var btn = document.getElementsByClassName ("btn_next_in_queue")[0];

if (btn)
{
	var btn_text = btn.getElementsByTagName ("span")[0];
	var btn_subtext = document.getElementsByClassName ("queue_sub_text")[0];
	if (btn_text && btn_subtext)
	{
		btn_text.textContent = "Loading next item...";
		btn_text.appendChild (document.createElement ("br"));
		btn_text.appendChild (btn_subtext);
	}
	btn.onclick.call (btn);
}