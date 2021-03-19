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
			"columnDefs": [
			    { orderable: false , targets: 2}
  			],
			"destroy": true,
			"deferRender": true,
			"stateSave": true,
			"data": dtdata,
			"dom": '<"top"iflprt><"bottom"iflp><"clear">',
			"lengthMenu": [ [50, 100, 250, 500, -1], [50, 100, 250, 500, "All"] ],
			"columns": [
				{ "data": "ts" 
					, "render": function(data, type, row, meta) {
						const d = new Date(data);
						let t = d.getFullYear();
						let str = t + "-";
						t = d.getMonth();
						str = str + ((t<10)? "0":"") + t + "-";
						t = d.getDay();
						str = str + ((t<10)? "0":"") + t + " ";
						
						t = d.getHours();
						str = str + ((t<10)? "0":"") + t + ":";
						t = d.getMinutes();
						str = str + ((t<10)? "0":"") + t + "";

						return type === 'display' ? str : data;
					}
				}
				,{ "data": "url" 
					,"render": function(data, type,row, meta) {
						return type === 'display' ? '<a target="_blank" href="' + data + '" a>' + data + '</a>' : data;
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

		$('#myTable tbody').on( 'click', 'tr', toggleRowSelection);

		function toggleRowSelection() {
			$(this).toggleClass('selected');
		} 

		$('#nuke').on("click",nuke);
		
		async function nuke() {
			let visualHistoryItems = {"visualHistoryItems": {}};
			visualHistoryItems = visualHistoryItems['visualHistoryItems'];
			await browser.storage.local.set({visualHistoryItems});
			loadTable();
		}

		$('#button').click( async function () {

			//console.log('button', );

			//console.log(data);
			//return;
			
			$('#myTable tbody').off( 'click', 'tr', toggleRowSelection);
			$('#nuke').off("click",nuke);

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

			for (let $el of $('#myTable tbody tr.selected') ) {
				var data = table.row($el).data();
				delete visualHistoryItems[data.url];
			}

			await browser.storage.local.set({visualHistoryItems});

			loadTable();
		} );
	}
	loadTable();

} );

