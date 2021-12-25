# Steam Discovery Queue Auto-Skipper
This userscript auto-advances when it detects that you are viewing a Steam Discovery Queue item.  

If your browser/setup supports it, it does this is a speedy way.  
If something goes wrong, it auto-retries and/or tries simulating a normal press on the "Next in Queue"-button.  
This should make sure that minor issues are automatically resolved.  

Age-restricted apps are automatically unlocked (i.e. this script supports automating 18+ confirmations) and runs through multiple discovery queues to get the maximum number of cards per day.  
This feature works outside of the discovery queues, too!

![Screenshot of the "Next in Queue" button](https://i.imgur.com/NuCCY8D.png)

## Why?
During the [Steam Winter Sale 2021](https://store.steampowered.com/points/howitworks) you get one trading card for going through your queue once a day.  
This script makes it easier to stay lazy.

## Sale
The script is optimized for the Steam Winter Sale 2021. Support for some of the functionality, including automation of multiple queues (only one this year), along with other features, might not work with future sales. The script will be updated in such a case.

### Winter Sale 2021
During the winter sale 2021, you can claim free stickers. This script will now also auto-claim these in the background and notify you about it.

## Installation
1. Install [Violentmonkey](https://violentmonkey.github.io/get-it/) or another userscript addon such as Tampermonkey for your browser.
2. Open `https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/raw/master/SteamDiscoveryQueueAutoSkipper.user.js` or click [here](https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/raw/master/SteamDiscoveryQueueAutoSkipper.user.js).
3. Click `Install`.  

## Problems?
Feel free to [open an issue](https://github.com/PotcFdk/SteamDiscoveryQueueAutoSkipper/issues) in case you feel that something is not the way it should be.

## Credits
Logo kindly provided by krys (krys#4143).

## Release Notes

### 0.11 (released 2021-12-23)
- NEW: winter sale 2021: Re-add ItemReward handler, and maybe this time we'll keep it in the script for future use!

### 0.10 (released 2021-01-13)
- REMOVE: ItemReward handler (page/data is gone from the Steam pages)

### 0.9 (released 2020-12-29)
- NEW: winter sale 2020: support for auto-claiming stickers (ItemReward)

### 0.8 (released 2020-12-25)
- NEW: the script now notifies you when you can get cards by browsing the discovery queue
