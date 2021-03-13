$(document).ready(async function() {


	async function loadTable(){

		let visualHistoryItems = {"visualHistoryItems": {}};
		try {
			visualHistoryItems = await browser.storage.local.get("visualHistoryItems");
		}catch(error){
			console.error(error);
		}

		if( typeof visualHistoryItems['visualHistoryItems'] === 'object') {
			visualHistoryItems = visualHistoryItems['visualHistoryItems'];
		}

		//console.log('visualHistory.js: visualHistoryItems',visualHistoryItems);


		dtdata = []
		Object.entries(visualHistoryItems).forEach(([key,value]) => {
			dtdata.push(value);
		});

		var table = $('#myTable').DataTable( {
			"destroy": true,
			"data": dtdata,
			"columns": [
				{ "data": "ts" 
					, "render": function(data, type, row, meta) {
						return type === 'display' ? (new Date(data)).toISOString() : data;
					}
				}
				,{ "data": "url" 
					,"render": function(data, type,row, meta) {
						return type === 'display' ? '<a href="' + data + '" a>' + data + '</a>' : data;
					}
				}
				,{ "data": "img" 
					,"render": function(data, type,row, meta) {
						return type === 'display' ? '<img src="' + data + '" width="250px" />': data;
					}
				}
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
			//console.log(d); 

			let visualHistoryItems = {"visualHistoryItems": {}};
			try {
				visualHistoryItems = await browser.storage.local.get("visualHistoryItems");
				//console.log('visualHistoryItems 1', visualHistoryItems);
			}catch(error){
				console.error(error);
			}

			if( typeof visualHistoryItems['visualHistoryItems'] === 'object') {
				visualHistoryItems = visualHistoryItems['visualHistoryItems'];
			}

			delete visualHistoryItems[d.url];

			await browser.storage.local.set({visualHistoryItems});

			loadTable();
		} );
	}
	loadTable();

} );

