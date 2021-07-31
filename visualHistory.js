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
	async function loadTable(){

		const entries = await idbKeyval.entries();
		const entries_length = entries.length;


		const dtdata = [];
		
		for(let i= 0;i< entries_length;++i){ // sadly still the fastes 
			dtdata.push(entries[i][1]);
		}
		//(await idbKeyval.entries()).map( val => val[1]);

		table = $('#myTable').DataTable( {
			"columnDefs": [
				{ orderable: false , targets: 2}
			],
			"processing": true,
			'language': {
				'loadingRecords': '&nbsp;',
				'processing': 'Loading...'
			},
			"destroy": true,
			"deferRender": true,
			"stateSave": true,
			"data": dtdata,
            /*"ajax": function (data, callback, settings) {

                //console.log(data);

                idbKeyval.entries().then( function(entries) {
                    //console.log(entries);

                let dtdata = [];
                entries.forEach(([key,value]) => {
                    dtdata.push(value);
                });

                callback(
                    //JSON.parse( localStorage.getItem('dataTablesData') )
                    { data: dtdata }
                );
                }).catch(console.error);
            },*/
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

		async function nuke() {

			if (confirm('Are you sure you want delete all displayed (aka. currently visible) entries?')) {
				var filteredRows = table.rows({filter: 'applied'}).data();
				for(var i = 0;i < filteredRows.length;i++) {
					const data = filteredRows[i];
					table.row(data).remove();
					await idbKeyval.del(data.url);
				}
				table.draw();
			}
		}

		$('#button').click( async function () {

			const selected = $('#myTable tbody tr.selected');

			if(selected.length < 1){
				alert('no rows selected');
				return;
			}

			for (let $el of selected ) {
				var data = table.row($el).data();
				await idbKeyval.del(data.url);
				table.row($el).remove();
			}
			table.draw();

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

