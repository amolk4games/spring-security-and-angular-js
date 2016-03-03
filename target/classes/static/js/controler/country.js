app.controller('CountryCtrl', CountryCtrl);
app.controller('CountryEditCtrl', CountryEditCtrl);
app.service('CountryEditor', CountryEditor);

CountryCtrl.$inject = [ '$scope', '$http', '$uibModal', 'CountryEditor', 'uiGridConstants' ];

function CountryCtrl($scope, $http, $uibModal, CountryEditor, uiGridConstants) {
	var vm = this;

	vm.editRow = CountryEditor.editRow;

	vm.countryGrid = {
		enableRowSelection : true,
		enableRowHeaderSelection : true,
		selectionRowHeaderWidth : 25,
		multiSelect : true,
		enableSorting : true,
		enableFiltering : true,
		enableGridMenu : true,
		exporterCsvFilename : 'export.csv',
		exporterCsvColumnSeparator : ';',
		exporterMenuPdf : false,
		rowTemplate : "<div ng-dblclick=\"grid.appScope.vm.editRow(grid, row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
	};

	vm.countryGrid.columnDefs = [ {
		field : 'id',
		displayName : 'Id',
		type : 'number',
		width : 70,
		sort : {
			direction : uiGridConstants.ASC,
			priority : 1
		}
	}, {
		field : 'name'
	}, {
		field : 'code2'
	}, {
		field : 'code3'
	}, {
		field : 'coden'
	} ];

	$http['get'](URL_COUNTRY_GETALL).success(function(response) {
		vm.countryGrid.data = response;
	});

	vm.countryGrid.onRegisterApi = function(gridApi) {
		$scope.gridApi = gridApi;
	};

	var d = new Date();
	$scope.addRow = function() {
		var newCountry= {
			"id" : "0",
			"name" : "",
			"code2" : "",
			"code3" : "",
			"coden" : "",
			"creation": d.getTime()
		};
		var rowTmp = {};
		rowTmp.entity = newCountry;
		vm.editRow($scope.vm.countryGrid, rowTmp);
	};

	$scope.removeSelectedtRow = function() {
		angular.forEach($scope.gridApi.selection.getSelectedRows(), function(data, index) {
			$http['delete'](URL_COUNTRY_DELETE + data.id).success(function(response) {
				vm.countryGrid.data.splice(vm.countryGrid.data.lastIndexOf(data), 1);
			});
		});
	};
	
	$scope.$on('openErrorModal', function(event, rejection) { 
    	var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modalerror.html',
            controller: 'ModalErrorCtrl',
            resolve: {
            	rejection: function() {
                    return rejection;
                }
            }
        });
    });
}

CountryEditor.$inject = [ '$rootScope', '$uibModal' ];

function CountryEditor($rootScope, $uibModal) {
	var service = {};
	
	var modalScope = $rootScope.$new();

	service.editRow = editRow;

	function editRow(grid, row) {
		modalScope.modalInstance = $uibModal.open({
			templateUrl : 'country-edit.html',
			controller : [ '$scope', '$http', 'grid', 'row', CountryEditCtrl ],
			controllerAs : 'vm',
			scope: modalScope,
			resolve : {
				grid : function() {
					return grid;
				},
				row : function() {
					return row;
				}
			}
		});
	}
	return service;
}

function CountryEditCtrl($scope, $http, grid, row) {
	var vm = this;
	vm.entity = angular.copy(row.entity);
	
	$scope.listCountry = new Array();
	
	$http['get'](URL_COUNTRY_GETALL).success(function(response) {
		$scope.listCountry = response;
	});
	
	$scope.dateOptions = {
			formatYear: 'yyyy',
			maxDate: new Date(2020, 5, 22),
			minDate: new Date(),
			startingDay: 1
	};
	$scope.creationDatePopup = {
		    opened: false
		  };
	$scope.openCreationDatePopup = function() {
	    $scope.creationDatePopup.opened = true;
	  };

	vm.save = save;
	function save() {
		var input = document.getElementById('flagFile');

	    var fr = new FileReader();
	    fr.onload = function () {
	        var data = fr.result;
	        //console.log(data);
	        data = data.substring(data.indexOf(",")+1,data.length);
	        //console.log(data);
	        vm.entity.flag = data;
	        //console.dir(vm.entity); 
			  $http['post'](URL_COUNTRY_SAVE, vm.entity).success(function(response) {
					row.entity = angular.extend(row.entity, response);
					if (grid.data !== undefined) {
						grid.data.push(row.entity);
					}
					$scope.modalInstance.close(row.entity);
				});
	    };
	    fr.readAsDataURL(input.files[0]);
	}

	vm.remove = remove;
	function remove() {
		if (row.entity.id != '0') {
			$http['delete'](URL_COUNTRY_DELETE + row.entity.id).success(function(response) {
				row.entity = angular.extend(row.entity, vm.entity);
				var index = grid.appScope.vm.countryGrid.data.indexOf(row.entity);
				grid.appScope.vm.countryGrid.data.splice(index, 1);
				$scope.modalInstance.close(row.entity);
			});
		}
	}
}