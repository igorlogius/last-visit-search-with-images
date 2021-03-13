
async function onBrowserActionClicked(tab) { 
	// open visualHistory html
	browser.tabs.create({url: "/visualHistory.html"});
}

async function saveToStorage(details) {

	console.log('saveToStorage');

	let tabInfo;
	try {
		tabInfo = await browser.tabs.get(details.tabId);
	}catch(error){
		console.error(error);
		return;
	}
	console.log('>> tab with tabId still exists');

	if( tabInfo.url !== details.url) {
		console.log('>>[STOP] tab url changed from ' , details.url, " to ", tabInfo.url);
		return;
	}
	console.log('>> tab url has not changed');

	//  CaptureTab
	
	let imgUri;
	try {
		const options = {
			"format": "jpeg"
			,"quality": 5
			//,"rect" : { "x": 0, "y": 0, "width": 100, "height": 100 }
			//,"scale": 1
		};
		imgUri = await browser.tabs.captureTab(details.tabId,options);
	}catch(error) {
		console.error(error);
		return;
	}
	//console.log(imgUri);
		
	let visualHistoryItems = {"visualHistoryItems": {}};
	try {
		visualHistoryItems = await browser.storage.local.get("visualHistoryItems");
		//console.log('visualHistoryItems 1', visualHistoryItems);
	}catch(error){
		console.error(error);
	}

	const item = {
		ts: details.timeStamp,
		img: imgUri,
		url: details.url
	}
	visualHistoryItems = visualHistoryItems['visualHistoryItems'];
	visualHistoryItems[details.url] = item;

	// reset / empty storage
	//visualHistoryItems = {};

	try {
		await browser.storage.local.set({visualHistoryItems});
		visualHistoryItems = await browser.storage.local.get("visualHistoryItems");
		console.log('visualHistoryItems 2', visualHistoryItems);
	}catch(error){
		console.error(error);
		return; 
	}

}

function onCompleted(details) {

	// Filter out any sub-frame related navigation event
	if (details.frameId !== 0) {
		return;
	}

	if (!details.url.startsWith("http://") &&  
	    !details.url.startsWith("https://")
	){
		return;
	}

	console.log(`>> onCompleted: ${details.url}`);

	// create a timeout function which takes the sceenshot
	//


	setTimeout(function() {
		console.log('setTimeout');
		saveToStorage(details);
	}, 3000);
}

const filter = {
	"url": ["*://*"],
	"schemes": ["http","https"]
}

browser.webNavigation.onCompleted.addListener(onCompleted /*, filter*/);
browser.browserAction.onClicked.addListener(onBrowserActionClicked); // menu permission
