define(["qlik", "jquery", './js/bootstrap.min', "text!./css/style.css", 'text!./css/jquery-ui.css', 'text!./css/scoped-bootstrap.css'], function (qlik, $, bootstrap, cssContent, jqueryUI, bootstrapCss) {
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
			var complete = false;
			var me = this;
			var lastrow = 0;
			var data = [];
			var qMatrix = [];
			this.backendApi.eachDataRow(function (rownum, row) {
				lastrow = rownum;
				$.each(row, function (key, cell) {
					// console.log(key,cell)
				});
			});


			if (this.backendApi.getRowCount() > lastrow + 1) {
				//we havent got all the rows yet, so get some more, 1000 rows
				var requestPage = [{
					qTop: lastrow + 1,
					qLeft: 0,
					qWidth: 10, //should be # of columns
					qHeight: Math.min(1000, this.backendApi.getRowCount() - lastrow)
				}];
				this.backendApi.getData(requestPage).then(function (dataPages) {
					//when we get the result trigger paint again
					qMatrix = qMatrix.concat(dataPages[0].qMatrix);
					me.paint($element);

					// complete = true;
					// console.log(complete)
					// console.log(dataPages)
					// console.log(data)
				});
			}




			if (this.backendApi.getRowCount() == lastrow + 1) {
				me.backendApi.eachDataRow(function (rownum, row) {
					lastrow = rownum;
					qMatrix.push(row[0]);
					//console.log(rownum);
					//do something with the row..
				});


				var app = qlik.currApp(this);
				var field = this.backendApi.getDimensionInfos()[0].qFallbackTitle//layout.qListObject.qDimensionInfo.qFallbackTitle;
				var object = qMatrix//layout.qListObject.qDataPages[0].qMatrix;

				var selPosVals = [];
				for (var i = 0; i < object.length; i++) {
					if (object[i].qState != "X" && object[i].qState != "A") {
						selPosVals.push(parseInt(object[i].qElemNumber));
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
							consecutive = false;
							break;
						}
					}
				}

				var sliderVals = [];
				if (consecutive == true) {
					sliderVals.push(selPosVals[0], selPosVals[selPosVals.length - 1]);
				} else {

				}

				app.getList("SelectionObject", function (reply) {

					var selectedFields = reply.qSelectionObject.qSelections;
					for (var i = 0; i < selectedFields.length; i++) {
						if (selectedFields[i].qField === field) {

						}
					}
				})

				var self = this //, html = "<ul>";
				var html = '<div style="margin: 15px; padding: 25px"> <div id="slider-range"></div> </div> <span id="sliderMsg"></span>'
				// <span id="sliderStart"></span><span>&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="sliderEnd"></span></span>	
				var data = qMatrix; //layout.qListObject.qDataPages[0].qMatrix
				// console.log(layout.qListObject)

				data.sort(function (a, b) {
					//console.log(a[0])
					if (a.qElemNumber < b.qElemNumber) return -1;
					if (a.qElemNumber > b.qElemNumber) return 1;
					return 0;
				})

				var sliderData = [];
				for (var i = 0; i < data.length; i++) {
					sliderData.push(data[i].qText);
				}



				console.log(lastrow)
				//console.log(data.length)



				$element.html(html);
				$("#slider-range").slider({
					range: true,
					min: 0,
					max: data.length - 1,
					//values: sliderVals,
					stop: function (event, ui) {
						//$("#sliderMsg").text( '( ' + (ui.values[1] - ui.values[0]) + ' values selected)' );
						var toSelect = []
						for (var i = ui.values[0]; i < ui.values[1] + 1; i++) {
							toSelect.push(i);
						}

						setTimeout(function () {
							$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
						}, 5);

						self.backendApi.selectValues(0, toSelect, false);
					},
					slide: function (event, ui) {
						setTimeout(function () {
							$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
						}, 5);
					},
					change: function (event, ui) {

						if (consecutive == true) {
							setTimeout(function () {
								$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
							}, 5);
						}
					},
					create: function (event, ui) {
						create(event, ui, $(this).slider('values', 0), $(this).slider('values', 1))
					}

				});

				if (consecutive == true) {
					$("#slider-range").slider("values", sliderVals);
				} else {

					$("#sliderMsg").text('Non consecutive values are selected/possible');
				}
			}
			// console.log(dataPages)
			/*

			*/

			function sortNumber(a, b) {
				return a - b;
			}

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


		}
	};
});