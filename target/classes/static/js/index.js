var URL_JSON_ERROR = 'json/errorCode.json';

var URL_COUNTRY_SAVE = 'rest/country/save';
var URL_COUNTRY_GETALL = 'rest/country/getAll';
var URL_COUNTRY_DELETE = 'rest/country/delete/';

var URL_USER_SAVE = 'admin/rest/user/save';
var URL_USER_GETALL = 'admin/rest/user/getAll';
var URL_USER_DELETE = 'admin/rest/user/delete/';

var DATE_FORMAT = 'dd/MM/yyyy';

var errorList = null;

var app = angular.module('hello', ['ngRoute', 'ui.bootstrap', 'ui.grid', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.exporter', 'ngSanitize', 'ui.select']);


app.config(['$httpProvider', function($httpProvider) {
	// Add the interceptor to the $httpProvider to intercept http calls
	$httpProvider.interceptors.push('HttpInterceptor');
}]);

app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

    var requireAuthentication = function() {
        return {
            load: function($q, $rootScope, $location, $http) {
                //console.log('Can user access route?');
                var deferred = $q.defer();
                deferred.resolve();
                $http.get('user', {}).success(function(data) {
                    //console.log('Yes they can!');
                    return deferred.promise;
                }).error(function() {
                    //console.log('No they cant!');
                    $location.path('/login');
                });
            }
        };
    };

    $routeProvider.when('/login', {
        templateUrl: 'login.html',
        controller: 'navigation',
        controllerAs: 'controller'
    }).when('/', {
        redirectTo: '/home'
    }).when('/home', {
        templateUrl: 'home.html',
        controller: 'home',
        controllerAs: 'controller',
        resolve: requireAuthentication()
    }).when('/country', {
        templateUrl: 'country.html',
        resolve: requireAuthentication()
    }).when('/admin/user', {
        templateUrl: 'admin/users.html',
        resolve: requireAuthentication()
    }).otherwise('/login');

    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

}]);

app.run(function ($rootScope, $http, $location) {
    $rootScope.hasRole = function (role) {
    	if ($rootScope.user == null || $rootScope.user === undefined || $rootScope.user.authorities == null || $rootScope.user.authorities === undefined) {
            return false;
        }
        for (var i = 0; i < $rootScope.user.authorities.length; i++) {
            if ($rootScope.user.authorities[i].authority == role)
                return true;
        }
        return false;
    };
});

app.controller('navigation', function($rootScope, $scope, $http, $location) {

    var self = this;

    var authenticate = function(credentials, callback) {

        var headers = credentials ? {
            authorization: "Basic " + btoa(credentials.username + ":" + credentials.password)
        } : {};

        $http.get('user', {
            headers: headers
        }).success(function(data) {
            if (data.name) {
                $rootScope.authenticated = true;
                $rootScope.user = data;
            } else {
                $rootScope.authenticated = false;
                $rootScope.user = null;
            }
            callback && callback();
        }).error(function() {
            $rootScope.authenticated = false;
            $rootScope.user = null;
            callback && callback();
        });

    }

    authenticate();
    self.credentials = {};
    self.login = function() {
        authenticate(self.credentials, function() {
            if ($rootScope.authenticated) {
                $location.path("/");
                self.error = false;
            } else {
                $location.path("/login");
                self.error = true;
            }
        });
    };

    self.logout = function() {
        $http.post('logout', {}).finally(function() {
            $rootScope.authenticated = false;
            $location.path("/");
        });
    };

    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };

});


//register the interceptor as a service
app.factory('HttpInterceptor', ['$q', '$rootScope', function($q, $rootScope) {
       return {
            // On request success
            request : function(config) {
                // Return the config or wrap it in a promise if blank.
                return config || $q.when(config);
            },

            // On request failure
            requestError : function(rejection) {
                //console.log(rejection); // Contains the data about the error on the request.  
                // Return the promise rejection.
                return $q.reject(rejection);
            },

            // On response success
            response : function(response) {
                //console.log(response); // Contains the data from the response.
                // Return the response or promise.
                return response || $q.when(response);
            },

            // On response failure
            responseError : function(rejection) {
                //console.log(rejection); // Contains the data about the error.
                
                //Check whether the intercept param is set in the config array. 
                //If the intercept param is missing or set to true, we display a modal containing the error
            	if (rejection.config && typeof rejection.config.intercept === 'undefined' || rejection.config.intercept)
                {
                    //emitting an event to draw a modal using angular bootstrap
            		$rootScope.$broadcast('openErrorModal', rejection);
            		//alert('error');
                }

                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
 }]);

app.controller('ModalErrorCtrl', ['$scope', '$http', '$location', 'rejection', function ($scope, $http, $location, rejection) {
	//console.log('inside ModalErrorCtrl');
	//console.dir(rejection);
	$scope.raison = null;
	
	if (!errorList) {
		//console.log('download error.json');
		$http['get'](URL_JSON_ERROR).success(function(response) {
			errorList = response;
			//console.log('errorSpoted');
	    	//console.dir(errorList);
	    	angular.forEach(errorList, function(error) {
	    		if (rejection.data.message.indexOf('.'+error.code +']') != -1) {
	    			$scope.raison = error.en;
	    		}
	        });
	    	if (!$scope.raison) {
	    		angular.forEach(errorList, function(error) {
	        		if (rejection.data.message.indexOf(error.code) != -1) {
	        			$scope.raison = error.en;
	        		}
	            });
	    		if (!$scope.raison) {
	    			$scope.raison = rejection.data.message;
	    		}
	    	}
	    });
	}
	else {
		//console.log('reuse error.json');
		angular.forEach(errorList, function(error) {
    		if (rejection.data.message.indexOf('.'+error.code +']') != -1) {
    			$scope.raison = error.en;
    		}
        });
		if (!$scope.raison) {
			angular.forEach(errorList, function(error) {
	    		if (rejection.data.message.indexOf(error.code) != -1) {
	    			$scope.raison = error.en;
	    		}
	        });
			if (!$scope.raison) {
				$scope.raison = rejection.data.message;
			}
		}
	}
}]);