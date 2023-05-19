# Steam Discovery Queue Auto-Skipper

## Supported Events / Features

Currently confirmed working:
- Steam Sports Fest 2023 (May 15 - May 22): auto-claiming free daily stickers ✅

## Description

This userscript automates several Steam event-related things.  

Primarily (and hence, the name) it auto-advances when it detects that you are viewing a Steam Discovery Queue item.  
During the **Steam Winter Sale 2022** you get one trading card for going through your queue once a day.  
This script makes it easier to stay lazy.  

If your browser/setup supports it, it does this is a speedy way. Multiple discovery queues are processed to get the maximum number of cards per day, if supported.  

![Screenshot of the "Next in Queue" button](https://i.imgur.com/NuCCY8D.png)

If something goes wrong, it auto-retries and/or tries simulating a normal press on the "Next in Queue"-button.  
This should make sure that minor issues are automatically resolved before the script can be manually fixed/adjusted for new events or site updates.  

## Additional Functionality

- Age-restricted apps are automatically unlocked (i.e. this script supports automating 18+ confirmations).
This feature works outside of the discovery queues, too!
- Finally, free daily stickers are also auto-claimed when they are detected.

## Sale
The script is optimized for the Steam Winter Sale 2022. Support for some of the functionality, including automation of multiple queues (only one this year), along with other features, might not work with future sales. The script will be updated in such a case.

## Installation
1. Install [Violentmonkey](https://violentmonkey.github.io/get-it/) or another userscript addon such as Tampermonkey for your browser.
2. Open `https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/raw/master/SteamDiscoveryQueueAutoSkipper.user.js` or click [here](https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/raw/master/SteamDiscoveryQueueAutoSkipper.user.js).
3. Click `Install`.  

## Issues?
Feel free to [open an issue](https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/issues) in case you feel that something is not the way it should be.

## Credits
Logo kindly provided by krys (krys#4143).

## Release Notes

### 0.12.0 (released 2022-12-22)
- FIX: ItemRewards handling is now working again with this year's pages
- FIX: possible login state detection issue, the new method should be a bit more reliable for now

### 0.11.1 (released 2021-12-25)
- NEW: remove all "last checked" timestamps when not logged in
- FIX: don't run and don't set the "last checked" timestamps for most features that require you to be logged in when not logged in

### 0.11 (released 2021-12-23)
- NEW: winter sale 2021: Re-add ItemReward handler, and maybe this time we'll keep it in the script for future use!

### 0.10 (released 2021-01-13)
- REMOVE: ItemReward handler (page/data is gone from the Steam pages)

### 0.9 (released 2020-12-29)
- NEW: winter sale 2020: support for auto-claiming stickers (ItemReward)

### 0.8 (released 2020-12-25)
- NEW: the script now notifies you when you can get cards by browsing the discovery queue
