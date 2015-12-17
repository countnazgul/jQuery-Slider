define(["qlik", "jquery", './js/bootstrap.min', './js/jQuery.slider.custom', "./js/global", "text!./css/style.css", 'text!./css/jquery-ui.css', 'text!./css/scoped-bootstrap.css'], function (qlik, $, bootstrap, slidercustom, global, cssContent, jqueryUI, bootstrapCss) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");
	$('<style>').html(bootstrapCss).appendTo('head');
	$('<style>').html(jqueryUI).appendTo('head');

	return {
		initialProperties: {
			qListObjectDef: {
				qShowAlternatives: true,
				qFrequencyMode: "V",
				qInitialDataFetch: [{
					qWidth: 1,
					qHeight: 1000
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimension: {
					type: "items",
					label: "Dimensions",
					ref: "qListObjectDef",
					min: 1,
					max: 1,
					items: {
						label: {
							type: "string",
							ref: "qListObjectDef.qDef.qFieldLabels.0",
							label: "Label",
							show: true
						},
						libraryId: {
							type: "string",
							component: "library-item",
							libraryItemType: "dimension",
							ref: "qListObjectDef.qLibraryId",
							label: "Dimension",
							show: function (data) {
								return data.qListObjectDef && data.qListObjectDef.qLibraryId;
							}
						},
						field: {
							type: "string",
							expression: "always",
							expressionType: "dimension",
							ref: "qListObjectDef.qDef.qFieldDefs.0",
							label: "Field",
							show: function (data) {
								return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
							}
						},
						frequency: {
							type: "string",
							component: "dropdown",
							label: "Frequency mode",
							ref: "qListObjectDef.qFrequencyMode",
							options: [{
								value: "N",
								label: "No frequency"
							}, {
									value: "V",
									label: "Absolute value"
								}, {
									value: "P",
									label: "Percent"
								}, {
									value: "R",
									label: "Relative"
								}],
							defaultValue: "V"
						}
					}
				},
				// sorting : {
				// 	uses : "sorting"
				// },				
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ($element, layout) {

			function sortNumber(a, b) {
				return a - b;
			}

			var app = qlik.currApp(this);
			var field = layout.qListObject.qDimensionInfo.qFallbackTitle;
			var object = layout.qListObject.qDataPages[0].qMatrix;
			//console.log(object)

			var selPosVals = [];
			//console.log(object)
			for (var i = 0; i < object.length; i++) {
				if (object[i][0].qState != "X" && object[i][0].qState != "A") {
					//console.log(object[i][0].qState)
					//console.log( object[i][0].qElemNumber)						
					selPosVals.push(parseInt(object[i][0].qElemNumber));
					//console.log(selPosVals)
				} else {

				}
			}

			selPosVals.sort(sortNumber);

			var consecutive = true;
			if (selPosVals.length != 1) {
				for (var i = 0; i < selPosVals.length - 1; i++) {
					if (selPosVals[i + 1] - selPosVals[i] == 1) {
						consecutive = true;
					} else {
						//console.log(selPosVals[i + 1] + ' ' + selPosVals[i])
						consecutive = false;
						//console.log('false')
						break;
					}
				}
			}

			var sliderVals = [];
			if (consecutive == true) {
				//console.log(sliderVals)
				sliderVals.push(selPosVals[0], selPosVals[selPosVals.length - 1]);
			} else {
				//console.log('false')
			}
			//console.log(selPosVals);			
			//console.log(sliderVals)

			//console.log(sliderVals)
			//$( "#slider-range" ).slider( "values", sliderVals[0], sliderVals[1] );
			//console.log( $( "#slider-range" ).slider( "values", 0 ) );

			app.getList("SelectionObject", function (reply) {

				var selectedFields = reply.qSelectionObject.qSelections;
				for (var i = 0; i < selectedFields.length; i++) {
					if (selectedFields[i].qField === field) {
						//min = selectedFields[i]
						//console.log(selectedFields[i])
					}
				}
			})

			var self = this //, html = "<ul>";
			var html = '<div style="margin: 15px; padding: 25px"> <div id="slider-range"></div> </div> <span id="sliderMsg"></span>'
			// <span id="sliderStart"></span><span>&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="sliderEnd"></span></span>	
			var data = layout.qListObject.qDataPages[0].qMatrix

			data.sort(function (a, b) {
				//console.log(a[0])
				if (a[0].qElemNumber < b[0].qElemNumber) return -1;
				if (a[0].qElemNumber > b[0].qElemNumber) return 1;
				return 0;
			})


			for (var i = 0; i < data.length; i++) {
				sliderData.push(data[i][0].qText);
			}
			
			// this.backendApi.eachDataRow(function (rownum, row) {

			// });
			//console.log(data.length)
			
			function create(event, ui, start, end) {
				var handles = $(event.target).find('span');
				handles.eq(0).tooltip({
					animation: false,
					placement: 'top',
					trigger: 'manual',
					container: handles.eq(0),
					title: start
				}).tooltip('show');
				handles.eq(1).tooltip({
					animation: false,
					placement: 'bottom',
					trigger: 'manual',
					container: handles.eq(1),
					title: end
				}).tooltip('show');
			}

			$element.html(html);
			$("#slider-range").dragslider({
				range: true,
				min: 0,
				max: data.length - 1,
				rangeDrag: true,
				//values: sliderVals,
				stop: function (event, ui) {
					//$("#sliderMsg").text( '( ' + (ui.values[1] - ui.values[0]) + ' values selected)' );
					var toSelect = []
					for (var i = ui.values[0]; i < ui.values[1] + 1; i++) {
						toSelect.push(i);
					}

					dragging = false;

					setTimeout(function () {
						$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
					}, 5);

					self.backendApi.selectValues(0, toSelect, false);
				},
				slide: function (event, ui) {
					if (dragging == false) {
						setTimeout(function () {
							//console.log('test')
							$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
							//console.log(sliderData[ui.value])
						}, 5);
					}
				},
				change: function (event, ui) {
					if (dragging == false) {
						if (consecutive == true) {
							setTimeout(function () {
								$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
							}, 5);
						}
					}
				},
				create: function (event, ui) {
					create(event, ui, $(this).dragslider('values', 0), $(this).dragslider('values', 1))
				}

			});

			if (consecutive == true) {
				$("#slider-range").dragslider("values", sliderVals);
			} else {

				$("#sliderMsg").text('Non consecutive values are selected/possible');
			}
		}
	};
});
