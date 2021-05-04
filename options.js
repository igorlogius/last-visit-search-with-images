
function onChange(evt) {

	id = evt.target.id;
	el = document.getElementById(id);

	let value = ( (el.type === 'checkbox') ? el.checked : el.value)
	let obj = {}

	//console.log(id,value, el.type,el.min);
	if(value === ""){
		return;
	}
	if(el.type === 'number'){
		try {
			value = parseInt(value);
			if(value === NaN){
				value = el.min;
			}
			if(value < el.min) {
				value = el.min;
			}
		}catch(e){
			value = el.min
		}
	}

	obj[id] = value;

	//console.log(id,value);
	browser.storage.local.set(obj).catch(console.error);

}

[ "delaytime" ].map( (id) => {

	browser.storage.local.get(id).then( (obj) => {

		el = document.getElementById(id);
		val = obj[id];

		if(typeof val !== 'undefined') {
			if(el.type === 'checkbox') {
				el.checked = val;
			}
			else{
				el.value = val;
			}
		}

	}).catch( (err) => {} );

	el = document.getElementById(id);
	el.addEventListener('click', onChange);
	el.addEventListener('keyup', onChange);
	el.addEventListener('keypress',
		function allowOnlyNumbers(event) {
			if (event.key.length === 1 && /\D/.test(event.key)) {
				event.preventDefault();
			}
		});
});


function deleteRow(rowTr) {
	var mainTableBody = document.getElementById('mainTableBody');
	mainTableBody.removeChild(rowTr);
}

function createTableRow(feed) {
	var mainTableBody = document.getElementById('mainTableBody');
	var tr = mainTableBody.insertRow();

	Object.keys(feed).sort().forEach( (key) => {

		if( key === 'activ'){
			//if(feed[key] !== null) {
				var input = document.createElement('input');
				input.className = key;
				input.placeholder = key;
				input.style.width = '100%';
				input.type='checkbox';
				//input.name="placeholdergroup";
				input.checked= (typeof feed[key] === 'boolean' && feed[key] === true)? true: false;
				//input.addEventListener("change", saveOptions);
				tr.insertCell().appendChild(input);
			/*}else{
				tr.insertCell();
			}*/

		}else if( key === 'regex'){
			//var input = document.createElement('textarea');
			var input = document.createElement('input');
			input.className = key;
			input.placeholder = key;
			//input.style.float = 'right';
			input.style.width = '100%';
			input.style.margin = '0px';
			input.value = feed[key];
			tr.insertCell().appendChild(input);
		}else
			if( key !== 'action'){
				var input = document.createElement('input');
				input.className = key;
				input.placeholder = key;
				input.style.width = '0px';
				input.value = feed[key];
				tr.insertCell().appendChild(input);
			}
	});

	var button;
	if(feed.action === 'save'){
		button = createButton("Create", "saveButton", function() {},  true);
	}else{
		button = createButton("Delete", "deleteButton", function() { deleteRow(tr); }, true );
	}
	tr.insertCell().appendChild(button);
}

function collectConfig() {
	// collect configuration from DOM
	var mainTableBody = document.getElementById('mainTableBody');
	var feeds = [];
	for (var row = 0; row < mainTableBody.rows.length; row++) {
		try {
			var name = mainTableBody.rows[row].querySelector('.regex').value.trim().toLowerCase();
            //console.log('name', name);
			try {
			var activ = mainTableBody.rows[row].querySelector('.activ').checked;
            //console.log('activ', activ);
			if(name !== '' &&  name.indexOf(" ") === -1 && name.length > 1) {
				feeds.push({
					'activ': activ,
					'regex': name
				});
			}
			}catch(e) {
				console.error(e);
			}
		}catch(e){
			console.error(JSON.stringify(e));
		}
	}
	return feeds;
}

function createButton(text, id, callback, submit) {
	var span = document.createElement('span');
	var button = document.createElement('button');
	button.id = id;
	button.textContent = text;
	button.className = "browser-style";
	if (submit) {
		button.type = "submit";
	} else {
		button.type = "button";
	}
	button.name = id;
	button.value = id;
	button.addEventListener("click", callback);
	span.appendChild(button);
	return span;
}

async function saveOptions(e) {
	var feeds = collectConfig();
	await browser.storage.local.set({ 'exclusions': feeds });
}

async function restoreOptions() {
	var mainTableBody = document.getElementById('mainTableBody');
	createTableRow({
		'activ': null,
		'regex': '' ,
		'action':'save'
	});
	var res = await browser.storage.local.get('exclusions');
	if ( !Array.isArray(res.exclusions) ) { return; }
	res.exclusions.forEach( (selector) => {
		selector.action = 'delete'
		createTableRow(selector);
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);

/*
const impbtnWrp = document.getElementById('impbtn_wrapper');
const impbtn = document.getElementById('impbtn');
const expbtn = document.getElementById('expbtn');

expbtn.addEventListener('click', async function (evt) {
    var dl = document.createElement('a');
    var res = await browser.storage.local.get('placeholder_urls');
    var content = JSON.stringify(res.placeholder_urls);
    //console.log(content);
    //	return;
    dl.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
    dl.setAttribute('download', 'data.json');
    dl.setAttribute('visibility', 'hidden');
    dl.setAttribute('display', 'none');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
});

// delegate to real Import Button which is a file selector
impbtnWrp.addEventListener('click', function(evt) {
	console.log('impbtnWrp');
	impbtn.click();
})

impbtn.addEventListener('input', function (evt) {

	console.log('impbtn');

	var file  = this.files[0];

	//console.log(file.name);

	var reader = new FileReader();
	        reader.onload = async function(e) {
            try {
                var config = JSON.parse(reader.result);
		//console.log("impbtn", config);
		await browser.storage.local.set({ 'placeholder_urls': config});
		document.querySelector("form").submit();
            } catch (e) {
                console.error('error loading file: ' + e);
            }
        };
        reader.readAsText(file);

});
*/
