
const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
const manifest = browser.runtime.getManifest();
const extname = manifest.name;

function log() {
	if(arguments.length < 2){
		throw 'invalid number of arguments';
	}
	const level = arguments[0].trim().toLowerCase();
	let msg = '';
	for (let i=1; i < arguments.length; i++) {
		msg = msg + arguments[i];
	}
	if (['error','warn'].includes(level) || ( temporary && ['debug','info','log'].includes(level))) {
		console[level]('[' + extname + '] [' + level.toUpperCase() + '] ' + msg);
	}
}


async function saveToStorage (details) {
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
	//log('DEBUG', "[CONTINUE] tabId " + details.tabId + " exists");

	//
	if( tabInfo.url !== details.url) {
		log('DEBUG', "[STOPPING] tabID "+ details.tabId +" with url " + details.url + "does not exist");
		return;
	}
	//log('DEBUG', "[CONTINUE] tabId "+ details.tabId +" with url " + details.url + " exist");

	// 
	const imgUri = await (async () => {
		try {
			const options = {"format":"jpeg","quality":6};
			return await browser.tabs.captureTab(details.tabId,options);
		}catch(error) {
			log('ERROR', "[STOPPING] tabId "+ details.tabId +" failed capture");
			return null;
		}
	})();
	if(imgUri === null){return;}
	//log('DEBUG', "[CONTINUE] tabId "+ details.tabId +" captured");
		
	//
	try {
	await idbKeyval.set(details.url, {
		ts: details.timeStamp,
		img: imgUri,
		url: details.url
	});
	//
		//log('DEBUG', "[CONTINUE] tabId " + details.tabId + " wrote item to storage");
	}catch(error){
		log('ERROR', "[STOPPING] tabId " + details.tabId + " failed to write item to storage");
	}
};

async function onCompleted (details) {

	if (details.frameId !== 0) { 
		//log('DEBUG', "[STOPPING] tabId " + details.tabId + " with url " + details.url + " is not a main frame"); 
		return; 
	}
	//log('DEBUG', "[CONTINUE] tabId " + details.tabId + " with url " + details.url + " is a main frame"); 
	//if ( !/^https?:\/\//.test(details.url) ){ 
	//	log('DEBUG', "[STOPPING] tabId " + details.tabId + " with url " + details.url + " has an invalid protocol"); 
	//	return; 
	//}
	//log('DEBUG', "[CONTINUE] tabId " + details.tabId + " with url " + details.url + " has an valid protocol"); 

	const delaytime = (await (async () => {
		try {
			let tmp = await browser.storage.local.get('delaytime');
			if (typeof tmp['delaytime'] !== 'undefined'){
				tmp = parseInt(tmp['delaytime']);
			}
			//console.log('tmp ', typeof tmp);
			
			if(typeof tmp === 'number') {
				if(tmp > 999){
					return tmp;
				}
			}
		}catch(e){
			console.error(e);
		}
		return 5000;
		
	})());

	//log('debug', '[INFO] delaytime := ' + delaytime);
	setTimeout( () => { saveToStorage(details); }, delaytime );
}

function onBrowserActionClicked(tab) { 
	browser.tabs.create({url: "visualHistory.html"});
}

browser.webNavigation.onCompleted.addListener(onCompleted, { url: [ {schemes: ["http","https"]}]} ); 
browser.browserAction.onClicked.addListener(onBrowserActionClicked);

