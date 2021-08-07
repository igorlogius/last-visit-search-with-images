$(document).ready(function() {


	var dateFormat = "yy-mm-dd";
	var table;

	$.fn.dataTable.ext.search.push(
		function( settings, data, dataIndex ) {
			var from_str = $('#from').val();
			var to_str = $('#to').val();
			var min = NaN;
			var max = NaN;
			var date;

			//console.log(from_str, " ", to_str, data[0]);

			if(from_str !== "" ) {
				date = $.datepicker.parseDate( dateFormat, from_str);
				min = parseInt( date.getTime(), 10 );
			}
			if(to_str !== "" ) {
				date = $.datepicker.parseDate( dateFormat, to_str);
				max = date.getTime() + 24*60*60*1000;
			}
			var age = parseFloat( data[0] ) || 0; // use data for the age column

			//console.log('min: ' + min, " max: ", max, " value: ", data[0]);

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
	function loadTable(){

		table = $('#myTable')
			 /*.on( 'processing.dt', function ( e, settings, processing ) {
		        	$('#processingIndicator').css( 'display', processing ? 'block' : 'none' );
    			})*/
			.DataTable( {
			"columnDefs": [
				{ orderable: false , targets: 2}
			],
			"processing": true,
			'language': {
				'loadingRecords': '&nbsp;',
				'processing': 'Please wait, processing records',
				'loadingRecords': "Please wait, loading records"
			},
			"destroy": false,
			"deferRender": true,
			"stateSave": true,
			"ajax": async function (data, callback, settings) {
				const entries = await idbKeyval.entries();
				const entries_length = entries.length;
				const dtdata = [];
				for(let i= 0;i< entries_length;++i){ // still the fastes 
					dtdata.push(entries[i][1]);
				}
				callback({data:dtdata});
			},
			"dom": '<"top"iflprt><"bottom"iflp><"clear">',
			"lengthMenu": [ [25, 50, 100, 250, 500, -1], [25, 50, 100, 250, 500, "All"] ],
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
						return type === 'display' ? '<a class="urlcell" target="_blank" href="' + data + '" a>' + data + '</a>' : data;
					}
				}
				,{ "data": "img"
					,"render": function(data, type,row, meta) {
						return type === 'display' ? '<img src="' + data + '" width="250px" class="thumbnail" />': data;
					}
				}
			]
		} );



		$('#myTable tbody').on( 'click', 'tr', toggleRowSelection);

		function toggleRowSelection() {
			$(this).toggleClass('selected');
		}

		$('#nuke').on("click",nuke);

		function nuke() {

			if (!confirm('Are you sure you want delete all displayed (aka. currently visible) entries?')) {
				return;
			}
			const filteredRows = table.rows({page: 'current', filter: 'applied'});
			const filteredRows_data = filteredRows.data();
			const filteredRows_len = filteredRows_data.length;
			if(filteredRows_len < 1){
				alert('nothing to delete on the current page');
				return;
			}
			for(let i = 0;i < filteredRows_len; i++) {
				console.log(filteredRows_data[i].url);
				idbKeyval.del(filteredRows_data[i].url);
			}
			filteredRows.remove().draw();
		}

		$('#button').click( function () {

			const filteredRows = table.rows('.selected'); 
			const filteredRows_data = filteredRows.data();
			const filteredRows_len = filteredRows_data.length;
			if(filteredRows_len < 1){
				alert('no rows selected');
				return;
			}
			for(let i = 0;i < filteredRows_len;i++) {
				idbKeyval.del(filteredRows_data[i].url);
			}
			filteredRows.remove().draw();

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
			date = $.datepicker.parseDate( dateFormat, element.value );
		} catch( error ) {
			date = null;
			console.error(error);
		}

		return date;
	}

} );

