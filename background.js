
const extId="visualHistory";

const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?

const log = (level, msg) => {
	level = level.trim().toLowerCase();
	if (['error','warn'].includes(level)
		|| ( temporary && ['debug','info','log'].includes(level))
	) {
		console[level](extId + '::' + level.toUpperCase() + '::' + msg);
		return;
	}
};


const saveToStorage = async (details) => {
	// 
	const tabInfo = await (async () => {
		try {
			return await browser.tabs.get(details.tabId);
		}catch(error){
			log('DEBUG', "[STOPPING] tabId " + details.tabId + " does not exist");
			return null;
		}
	})();
	if(tabInfo === null){return;}
	log('DEBUG', "[CONTINUE] tabId " + details.tabId + " exists");

	//
	if( tabInfo.url !== details.url) {
		log('DEBUG', "[STOPPING] tabID "+ details.tabId +" with url " + details.url + "does not exist");
		return;
	}
	log('DEBUG', "[CONTINUE] tabId "+ details.tabId +" with url " + details.url + " exist");

	// 
	const imgUri = await (async () => {
		try {
			const options = {"format":"jpeg","quality":5};
			return await browser.tabs.captureTab(details.tabId,options);
		}catch(error) {
			log('ERROR', "[STOPPING] tabId "+ details.tabId +" failed capture");
			return null;
		}
	})();
	if(imgUri === null){return;}
	log('DEBUG', "[CONTINUE] tabId "+ details.tabId +" captured");
		
	//
	let visualHistoryItems = {"visualHistoryItems": {}};
	try {
		visualHistoryItems = await browser.storage.local.get("visualHistoryItems");
		log('DEBUG', "[CONTINUE] tabId " + details.tabId + " got items from storage");
	}catch(error){
		console.error(error);
		log('ERROR', "[STOPPING] tabId " + details.tabId + " failed to get items from storage");
		return;
	}
	//
	if( typeof visualHistoryItems['visualHistoryItems'] === 'object') {
		visualHistoryItems = visualHistoryItems['visualHistoryItems'];
	}
	//
	visualHistoryItems[details.url] = {
		ts: details.timeStamp,
		img: imgUri,
		url: details.url
	};
	//
	try {
		await browser.storage.local.set({visualHistoryItems});
		log('DEBUG', "[CONTINUE] tabId " + details.tabId + " wrote item to storage");
	}catch(error){
		log('ERROR', "[STOPPING] tabId " + details.tabId + " failed to write item to storage");
	}
};

const onCompleted = (details) => {

	if (details.frameId !== 0) { 
		log('DEBUG', "[STOPPING] tabId " + details.tabId + " with url " + details.url + " is not a main frame"); 
		return; 
	}
	log('DEBUG', "[CONTINUE] tabId " + details.tabId + " with url " + details.url + " is a main frame"); 

	if ( !/^https?:\/\//.test(details.url) ){ 
		log('DEBUG', "[STOPPING] tabId " + details.tabId + " with url " + details.url + " has an invalid protocol"); 
		return; 
	}
	log('DEBUG', "[CONTINUE] tabId " + details.tabId + " with url " + details.url + " has an valid protocol"); 

	setTimeout( () => {
		saveToStorage(details);
	}, 5000);
};

const onBrowserActionClicked = (tab) => { 
	browser.tabs.create({url: "visualHistory.html"});
};

browser.webNavigation.onCompleted.addListener(onCompleted); 
browser.browserAction.onClicked.addListener(onBrowserActionClicked);
