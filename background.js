
const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
const manifest = browser.runtime.getManifest();
const extname = manifest.name;

let tkvs = new TKVS('keyval-store','keyval');

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
			const options = {"format":"jpeg","quality":6};
			return await browser.tabs.captureTab(details.tabId,options);
		}catch(error) {
			log('ERROR', "[STOPPING] tabId "+ details.tabId +" failed capture");
			return null;
		}
	})();
	if(imgUri === null){return;}
	log('DEBUG', "[CONTINUE] tabId "+ details.tabId +" captured");

	//
	try {
	await tkvs.set(details.url, {
		ts: Date.now(), //details.timeStamp, // millisec since epoch
		img: imgUri,
		url: details.url
	});
	//
		log('DEBUG', "[CONTINUE] tabId " + details.tabId + " wrote item to storage");
	}catch(error){
		log('ERROR', "[STOPPING] tabId " + details.tabId + " failed to write item to storage");
	}
};

async function onUpdated(tabId, changeInfo, tab) {

    const details = {
            tabId: tabId,
            url: tab.url
    }

    const isExcluded = (await (async () => {

        const selectors = await ((async () => {
            try {
                const tmp = await browser.storage.local.get('exclusions');
                if(typeof tmp['exclusions'] !== 'undefined') {
                    return tmp['exclusions'];
                }
            }catch(e){
                console.error(e);
            }
            return [];
        })());


        for(const selector of selectors) {
            try {
                if(typeof selector.activ === 'boolean'
                    && selector.activ === true
                    && typeof selector.regex === 'string'
                    && (new RegExp(selector.regex)).test(details.url)
                ){
                    return true;
                }
            }catch(e){
                console.error(e);
            }
        }
        return false;
    })());

    if(isExcluded) {
		log('DEBUG', "[STOPPING] tabId " + details.tabId + " with url " + details.url + " is excluded");
        return;
    }

	const delaytime = (await (async () => {
		try {
			let tmp = await browser.storage.local.get('delaytime');
			if (typeof tmp['delaytime'] !== 'undefined'){
				tmp = parseInt(tmp['delaytime']);
			}
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

	log('debug', '[INFO] delaytime := ' + delaytime);
	setTimeout( () => { saveToStorage(details); }, delaytime );
}

function onBrowserActionClicked(tab) {
	browser.tabs.create({url: "main.html"});
}

browser.tabs.onUpdated.addListener(onUpdated, { properties: ['url'], urls: ['<all_urls>'] });
browser.browserAction.onClicked.addListener(onBrowserActionClicked);
