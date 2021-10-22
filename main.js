$(document).ready(function() {

	const dateFormat = "yy-mm-dd";

	$.fn.dataTable.ext.search.push(
		function( settings, data, dataIndex ) {

			const min = (function() {
				const from_str = $('#from').val();
				if(from_str !== "" ) {
					try {
						const date = $.datepicker.parseDate( dateFormat, from_str);
						return parseInt( date.getTime(), 10 );
					}catch(e){
						console.error(e);
					}
				}
				return NaN;
			})();

			const max = (function() {
				const to_str = $('#to').val();
				if(to_str !== "" ) {
					try {
						const date = $.datepicker.parseDate( dateFormat, to_str);
						return parseInt( date.getTime(), 10 );
					}catch(e){
						console.error(e);
					}
				}
				return NaN;
			})();

			const age = parseFloat( data[0] ) || 0; // use data for the age column

			console.log('min: ' + min, " max: ", max, " value: ", data[0]);

			return ( ( isNaN( min ) && isNaN( max ) ) ||
				( isNaN( min ) && age <= max ) ||
				( min <= age   && isNaN( max ) ) ||
				( min <= age   && age <= max ) );
		});

	let table = $('#myTable').DataTable( {
		'columnDefs': [
			{ orderable: false , targets: 2}
		],
		'processing': true,
		'language': {
		        //'processing': '<div id="outerProgress"><div id="innerProgress"></div></div>',
			'loadingRecords': "Loading,<br/>please wait"
		},
		"deferRender": true,
		"stateSave": true,
                       "ajax": async function (data, callback, settings) {
			       /*
                               const entries = await idbKeyval.entries();
                               const entries_length = entries.length;
                               const dtdata = [];
                               function timeout(ms) {
                                       return new Promise(resolve => setTimeout(resolve, ms))
                               }

                               //$('#myTable_processing')[0].innerHTML = '<div id="outerProgress"><div id="innerProgress"></div></div>';
                               const el = document.getElementById("innerProgress");

                               function percentage(partialValue, totalValue) {
                                       return (100 * partialValue) / totalValue;
                               }

                               let i = 0;
                               let intervalId = setInterval(() => {
                                       const val = parseInt(percentage(i,entries_length))
                                       el.style.width =  val + "%";
                                       el.innerText = val + "%";
                               },100);

                               for(;i< entries_length;++i){ // still the fastes 
                                       dtdata.push(entries[i][1]);
                                       //$('#myTable_processing')[0].innerText = 'Loading records ' + i + ' of ' + entries_length + ' done';
                                       //console.log(el.value);
                                       //const val = parseInt(percentage(i,entries_length))
                                       //el.style.width =  val + "%";
                                       //el.innerText = val + "%";
                                       await timeout(1);
                               }
                               clearInterval(intervalId);
                               el.style.width = "100%";
                               el.innerText = "done";
                               await timeout(100);


                               callback({data:dtdata});
			       */
			       callback({data: (await idbKeyval.values()) });
                       },

		/*
		"ajax": async function(data, callback, settings)  {
			
			       const entries = await idbKeyval.entries();
                               const entries_length = entries.length;
                               const dtdata = [];
                               function timeout(ms) {
                                       return new Promise(resolve => setTimeout(resolve, ms))
                               }

                               const el = document.getElementById("innerProgress");

                               function percentage(partialValue, totalValue) {
                                       return (100 * partialValue) / totalValue;
                               }

                               let i = 0;
                               let intervalId = setInterval(() => {
                                       const val = parseInt(percentage(i,entries_length))
                                       el.style.width =  val + "%";
                                       el.innerText = val + "%";
                               },100);

                               for(;i< entries_length;++i){ // still the fastes
                                       //dtdata.push(entries[i][1]);
                                       await timeout(1);
                               }
                               clearInterval(intervalId);
                               el.style.width = "100%";
                               el.innerText = "done";
                               await timeout(100);

                               callback({data:dtdata});

			//
			//


			callback({data: (await idbKeyval.values())});
		},
		*/
		"dom": '<"top"flip>rt',
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
					return type === 'display' ? '<a class="urlcell" target="_blank" href="' + data + '" a>' + data + '</a>': data;
				}
			}
			,{ "data": "img"
				,"render": function(data, type,row, meta) {
					return type === 'display' ? '<img loading="lazy" src="' + data + '" width="250px" class="thumbnail" />': data;
				}
			}
		]
	});

	$('#myTable tbody').on( 'click', 'tr', function () {
		$(this).toggleClass('selected');
	});

	$('#myTable_filter input').unbind();
	$('#myTable_filter input').bind('keyup', function(e) {
		if(e.keyCode == 13) {
			table.search(this.value).draw();
		}
	});

	$('#searchBtn').click(function(){ 
		table.search(
			$('#myTable_filter input').val()
		).draw(); 
	});

	$('#removeDisplayed').click(function() {
		const filteredRows = table.rows({page: 'current', filter: 'applied'});
		const filteredRows_data = filteredRows.data();
		const filteredRows_len = filteredRows_data.length;
		if(filteredRows_len < 1){
			alert('nothing to delete on the current page');
			return;
		}
		if (!confirm('Are you sure you want delete all displayed (aka. currently visible) entries?')) {
			return;
		}
		filteredRows.remove().draw();
		for(let i = 0;i < filteredRows_len;++i) {
			idbKeyval.del(filteredRows_data[i].url);
		}
	});

	$('#removeSelected').click( function () {
		const filteredRows = table.rows('.selected'); 
		const filteredRows_data = filteredRows.data();
		const filteredRows_len = filteredRows_data.length;
		if(filteredRows_len < 1){
			alert('no rows selected');
			return;
		}
		if (!confirm('Are you sure you want delete the selected entries?')) {
			return;
		}
		filteredRows.remove().draw();
		for(let i = 0;i < filteredRows_len;++i) {
			idbKeyval.del(filteredRows_data[i].url);
		}
	});

	let from = $( "#from" )
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
		});

	let to = $( "#to" ).datepicker({
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

	$('#resetFrom').click(function(){ $('#from').val(''); table.draw();});
	$('#resetTo').click(function(){ $('#to').val('');table.draw(); });
	$('#resetSearchBtn').click(function(){ table.search('').draw(); });

			

	function getDate( element ) {
			console.log('getDate',element.value);
		try {
			return $.datepicker.parseDate( dateFormat, element.value );
		} catch( error ) {
			console.error(error);
		}
		return null;
	}

} );

