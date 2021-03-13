//(async function() {
	$(document).ready(async function() {


	async function loadTable(){

	let visualHistoryItems = {"visualHistoryItems": {}};
	try {
		visualHistoryItems = await browser.storage.local.get("visualHistoryItems");
	}catch(error){
		console.error(error);
	}
	
	visualHistoryItems = visualHistoryItems['visualHistoryItems'];

	console.log('visualHistory.js: visualHistoryItems',visualHistoryItems);

	
	dtdata = []
	Object.entries(visualHistoryItems).forEach(([key,value]) => {
		dtdata.push(value);
	});
	
	//$(document).ready(function() {
		var table = $('#myTable').DataTable( {
			"destroy": true,
			"data": dtdata,
			"columns": [
				{ "data": "ts" 
					, "render": function(data, type, row, meta) {

						return (new Date(data)).toISOString();
					}
				}
				,{ "data": "url" 
					,"render": function(data, type,row, meta) {
						return '<a href="' + data + '" a>' + data + '</a>';
					}
				}
				,{ "data": "img" 
					,"render": function(data, type,row, meta) {
						return type === 'display' ? '<img src="' + data + '" width="250px" />': data;
					}
				}
				//,{ "data": "url" }
				//,{ "data": "img" }
			]
		} );


		//alert( 'There are'+table.data().length+' row(s) of data in this table' );

			$('#myTable tbody').on( 'click', 'tr', function () {
				if ( $(this).hasClass('selected') ) {
					$(this).removeClass('selected');
				}
				else {
					table.$('tr.selected').removeClass('selected');
					$(this).addClass('selected');
				}
			} );

			$('#nuke').click( async function () {
				let visualHistoryItems = {"visualHistoryItems": {}};
				visualHistoryItems = visualHistoryItems['visualHistoryItems'];
				await browser.storage.local.set({visualHistoryItems});
				loadTable();
			});

			$('#button').click( async function () {

				// get data from storage
				var d = table.row('.selected' ).data() 
				console.log(d); 

				let visualHistoryItems = {"visualHistoryItems": {}};
				try {
					visualHistoryItems = await browser.storage.local.get("visualHistoryItems");
					//console.log('visualHistoryItems 1', visualHistoryItems);
				}catch(error){
					console.error(error);
				}

				visualHistoryItems = visualHistoryItems['visualHistoryItems'];

				console.log('blubbdadaer   ', visualHistoryItems[d.url]);


				delete visualHistoryItems[d.url];
		
				await browser.storage.local.set({visualHistoryItems});

				//table.row('.selected').remove().draw( false );
				//
				loadTable();
				

				//browser.storage.local.set({visualHistoryItems});
		} );
	}
				loadTable();

	} );

	/*
	let main = document.querySelector('#main');

	console.log(visualHistoryItems);

	
	Object.entries(visualHistoryItems).forEach(([key,value]) => {
		var elem = document.createElement("img");
		elem.setAttribute("height", "100");
		elem.setAttribute("width", "100");
		elem.setAttribute("alt", key);
		elem.src = value.img;
		main.appendChild(elem);

	});
	*/
	
//}());
