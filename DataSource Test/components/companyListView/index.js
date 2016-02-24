'use strict';

app.companyListView = kendo.observable({
	onShow: function () {},
	afterShow: function () {}
});

// START_CUSTOM_CODE_companyListView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_companyListView
(function (parent) {
	var dataProvider = app.data.dataSourceTest,
		flattenLocationProperties = function (dataItem) {
			var propName, propValue,
				isLocation = function (value) {
					return propValue && typeof propValue === 'object' &&
						propValue.longitude && propValue.latitude;
				};

			for (propName in dataItem) {
				if (dataItem.hasOwnProperty(propName)) {
					propValue = dataItem[propName];
					if (isLocation(propValue)) {
						dataItem[propName] =
							kendo.format('Latitude: {0}, Longitude: {1}',
								propValue.latitude, propValue.longitude);
					}
				}
			}
		},
		dataSourceOptions = {
			type: 'everlive',
			transport: {
				typeName: 'Company',
				dataProvider: dataProvider
			},

			change: function (e) {
				var data = this.data();
				for (var i = 0; i < data.length; i++) {
					var dataItem = data[i];

					flattenLocationProperties(dataItem);
				}
			},
			error: function (e) {
				if (e.xhr) {
					alert(JSON.stringify(e.xhr));
				}
			},
			schema: {
				model: {
					fields: {
						'Name': {
							field: 'Name',
							defaultValue: ''
						},
					}
				}
			},
			serverSorting: true,
			serverPaging: true,
			pageSize: 50
		},
		dataSource = new kendo.data.DataSource(dataSourceOptions),
		companyListViewModel = kendo.observable({
			dataSource: dataSource,
			itemClick: function (e) {
				app.mobileApp.navigate('#components/companyListView/details.html?uid=' + e.dataItem.uid);
			},
			editClick: function () {
				var uid = this.currentItem.uid;
				app.mobileApp.navigate('#components/companyListView/edit.html?uid=' + uid);
			},
			detailsShow: function (e) {
				var item = e.view.params.uid,
					companyID = e.view.params.companyID,
					dataSource = companyListViewModel.get('dataSource');
				if (companyID) {
					var itemModel = dataSource.get(companyID);

				} else {
					var itemModel = dataSource.getByUid(item);

				}
				if (!itemModel) {
					alert("Open Company List First");
					app.mobileApp.navigate('#:back');

				} else {
					if (!itemModel.Name) {
						itemModel.Name = String.fromCharCode(160);
					}

					companyListViewModel.set('currentItem', null);
					companyListViewModel.set('currentItem', itemModel);
				}
			},
			currentItem: null
		});

	parent.set('editItemViewModel', kendo.observable({
		onShow: function (e) {
			var itemUid = e.view.params.uid,
				dataSource = companyListViewModel.get('dataSource'),
				itemData = dataSource.getByUid(itemUid);

			this.set('itemData', itemData);
			this.set('editFormData', {
				name: itemData.Name,
			});
		},
		onSaveClick: function (e) {
			var editFormData = this.get('editFormData'),
				itemData = this.get('itemData'),
				dataSource = companyListViewModel.get('dataSource');

			// prepare edit
			itemData.set('Name', editFormData.name);

			dataSource.one('sync', function (e) {
				app.mobileApp.navigate('#:back');
			});

			dataSource.one('error', function () {
				dataSource.cancelChanges(itemData);
			});

			dataSource.sync();
		}
	}));

	if (typeof dataProvider.sbProviderReady === 'function') {
		dataProvider.sbProviderReady(function dl_sbProviderReady() {
			parent.set('companyListViewModel', companyListViewModel);
		});
	} else {
		parent.set('companyListViewModel', companyListViewModel);
	}
})(app.companyListView);

// START_CUSTOM_CODE_companyListViewModel
// END_CUSTOM_CODE_companyListViewModel