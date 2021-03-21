$(document).ready(async function() {


		var dateFormat = "yy-mm-dd";
	var table; 

	$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
	var from_str = $('#from').val();
	var to_str = $('#to').val();
	var min = NaN;
	var max = NaN;
	    var date;

	    console.log(from_str, " ", to_str, data[0]);

	if(from_str !== "" ) {
		date = $.datepicker.parseDate( dateFormat, from_str);
        	min = parseInt( date.getTime(), 10 );
	}
	if(to_str !== "" ) {
	    	date = $.datepicker.parseDate( dateFormat, to_str);
        	max = date.getTime() + 24*60*60*1000;
	}
        var age = parseFloat( data[0] ) || 0; // use data for the age column

	    console.log('min: ' + min, " max: ", max, " value: ", data[0]);

        if ( ( isNaN( min ) && isNaN( max ) ) ||
             ( isNaN( min ) && age <= max ) ||
             ( min <= age   && isNaN( max ) ) ||
             ( min <= age   && age <= max ) )
        {
            return true;
        }
        return false;
    }
);
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

		table = $('#myTable').DataTable( {
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
						str = d.getFullYear() + "-";
						t = "";
						t = (d.getMonth()+1)
						str = str + ((t<10)? "0":"") + t + "-";
						t = (d.getDate())
						str = str + ((t<10)? "0":"") + t + " ";

						t = (d.getHours())
						str = str + ((t<10)? "0":"") + t + ":";
						t = (d.getMinutes())
						str = str + ((t<10)? "0":"") + t;

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


			var from = $( "#from" )
			.datepicker({
				dateFormat: dateFormat,
				//defaultDate: "+1w",
				changeMonth: true,
				changeYear: true,
				numberOfMonths: 1
			})
			.on( "change", function() {
				to.datepicker( "option", "minDate", getDate( this ) );
				table.draw();
			}),
			to = $( "#to" ).datepicker({
				dateFormat: dateFormat,
				//defaultDate: "+1w",
				changeMonth: true,
				changeYear: true,
				numberOfMonths: 1
			})
			.on( "change", function() {
				from.datepicker( "option", "maxDate", getDate( this ) );
				table.draw();
			});

		function getDate( element ) {
			var date;
			try {
				console.log(element.value);
				date = $.datepicker.parseDate( dateFormat, element.value );
				console.log(date.getTime()/1000);
			 	
			} catch( error ) {
				date = null;
				console.error(error);
			}

			return date;
		}

} );

