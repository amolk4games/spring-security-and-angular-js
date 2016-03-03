app.controller('UserCtrl', UserCtrl);
app.controller('UserEditCtrl', UserEditCtrl);
app.service('UserEditor', UserEditor);

UserCtrl.$inject = [ '$scope', '$http', '$uibModal', 'UserEditor', 'uiGridConstants' ];

function UserCtrl($scope, $http, $uibModal, UserEditor, uiGridConstants) {
	var vm = this;

	vm.editRow = UserEditor.editRow;

	vm.userGrid = {
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

	vm.userGrid.columnDefs = [ {
		field : 'userid',
		displayName : 'Id',
		type : 'number',
		width : 70,
		sort : {
			direction : uiGridConstants.ASC,
			priority : 1
		}
	}, {
		field : 'username'
	}, {
		field : 'enabled'
	}, {
		field: 'getRoles()',
        displayName: 'Roles',
	}];

	$http['get'](URL_USER_GETALL).success(function(response) {
		angular.forEach(response, function(row) {
			row.getRoles = function() {
				var rolesList = '';
				angular.forEach(row.userRoles, function(role) {
					rolesList = rolesList + role.role + ', ';
				});
				return rolesList.substring(0, rolesList.length - 2);
			}
		});
		
		
		vm.userGrid.data = response;
	});

	vm.userGrid.onRegisterApi = function(gridApi) {
		$scope.gridApi = gridApi;
	};

	$scope.addRow = function() {
		var newUser= {
			"userid" : 0,
			"username" : "",
			"password" : "",
			"enabled" : true,
			"userRoles" : []
		};
		var rowTmp = {};
		rowTmp.entity = newUser;
		vm.editRow($scope.vm.userGrid, rowTmp);
	};

	$scope.removeSelectedtRow = function() {
		angular.forEach($scope.gridApi.selection.getSelectedRows(), function(data, index) {
			$http['delete'](URL_USER_DELETE + data.userid).success(function(response) {
				vm.userGrid.data.splice(vm.userGrid.data.lastIndexOf(data), 1);
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

UserEditor.$inject = [ '$rootScope', '$uibModal' ];

function UserEditor($rootScope, $uibModal) {
	var service = {};
	
	var modalScope = $rootScope.$new();

	service.editRow = editRow;

	function editRow(grid, row) {
		modalScope.modalInstance = $uibModal.open({
			templateUrl : 'admin/users-edit.html',
			controller : [ '$scope', '$http', 'grid', 'row', UserEditCtrl ],
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

function UserEditCtrl($scope, $http, grid, row) {
	var vm = this;
	vm.entity = angular.copy(row.entity);
	
	var bcrypt = new bCrypt();
	
	if (vm.entity.userRoles != null && vm.entity.userRoles.length ==2) {
		$scope.radioRole = 'ROLE_ADMIN';
	}
	else {
		$scope.radioRole = 'ROLE_USER';
	}

	vm.save = save;
	function save() {
		
		var encodePassword = false;
		
		if (vm.entity.password1) {
			if (vm.entity.password2) {
				if (vm.entity.password1 != vm.entity.password2) {
					alert('password are not the same');
					return;
				}
				else {
					encodePassword = true;
				}
				
			}
		}
		
		if (!bcrypt.ready() && encodePassword) {
			alert('Password encryptor not yet initialized. Try again in a few seconds');
			return null;
		}
		
		function saveUser(hash){
			//console.log('Save user function: ' + hash);
			var idRoleAdmin = 0;
			var idRoleUser = 0;
			
			for (var i = 0; i < vm.entity.userRoles.length; i++) {
				if (vm.entity.userRoles[i].role == 'ROLE_USER') {
					idRoleUser = vm.entity.userRoles[i].userRoleId;
				} else {
					idRoleAdmin = vm.entity.userRoles[i].userRoleId;
				}
			}
			
			var userRole = {
	                "userRoleId": idRoleUser,
	                "role": 'ROLE_USER'
	            };
			
			var adminRole = {
	                "userRoleId": idRoleAdmin,
	                "role": 'ROLE_ADMIN'
	            };
			
			if (hash) {
				vm.entity.password = hash;
			}
			vm.entity.userRoles = [];
			vm.entity.userRoles.push(userRole);
			if ($scope.radioRole == 'ROLE_ADMIN') {
				vm.entity.userRoles.push(adminRole);
			}
			
			$http['post'](URL_USER_SAVE, vm.entity).success(function(response) {
				row.entity = angular.extend(row.entity, response);
				if (grid.data !== undefined) {
					row.entity.getRoles = function() {
						var rolesList = '';
						angular.forEach(row.entity.userRoles, function(role) {
							rolesList = rolesList + role.role + ', ';
						});
						return rolesList.substring(0, rolesList.length - 2);
					}
					grid.data.push(row.entity);
				}
				$scope.modalInstance.close(row.entity);
			});
			
		}
		
		if (encodePassword) {
			var salt = bcrypt.gensalt(1);
			
			function resultBcrypt(hash){
				//console.log(hash);
				saveUser(hash);
			}
			
			bcrypt.hashpw(vm.entity.password1,salt, resultBcrypt);
			
		} else {
			saveUser();
		}
		
		
		
		
		
		
	}

	vm.remove = remove;
	function remove() {
		if (row.entity.id != '0') {
			$http['delete'](URL_USER_DELETE + row.entity.userid).success(function(response) {
				row.entity = angular.extend(row.entity, vm.entity);
				var index = grid.appScope.vm.userGrid.data.indexOf(row.entity);
				grid.appScope.vm.userGrid.data.splice(index, 1);
				$scope.modalInstance.close(row.entity);
			});
		}
	}
}

function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    if ((new Date().getTime() - start) > milliseconds){
	      break;
	    }
	  }
	}