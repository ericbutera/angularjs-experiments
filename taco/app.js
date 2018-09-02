var tacoApp = angular.module('tacoApp', []);

tacoApp.factory('RequestService', ['$http', '$q', '$log', function($http, $q, $log){
    // amount of time to wait between retries
    var RETRY_WAIT = 1000 * 3;

    // maximum retry count
    var RETRY_MAX = 3;

    return {
        request: function(url, config) {
            var counter = 0;
            var deferred = $q.defer();

            // allow configuration to be overwritten as a config param
            var config = angular.extend({
                url: url,
                method: 'GET'
            }, config || {});

            function doRequest() {
                $log.log("xhr start config %o", config);
                $http(config)
                .then(function response(response){
                    $log.debug("xhr response %o", response);
                    if (response.status && response.status == 200 &&
                        response.data
                    ) {
                        $log.log("Resolving response %o", response);
                        deferred.resolve(response.data);
                    } else {
                        $log.log("Rejecting response %o", response);
                        deferred.reject("invalid response");
                    }
                }, function fatalError(response){
                    $log.warn("error response %o", response);
                    // handle 300 redirects?  
                    // handle 400 errors?
                    if (counter == RETRY_MAX) {
                        $log.warn("max retries hit for %o", response.config);
                        deferred.reject("unable to contact service");
                    } else if (response.status && (response.status == -1 || response.status >= 500)) {
                        counter++;
                        setTimeout(function() { 
                            deferred.notify("retrying xhr "+ counter +" of "+ RETRY_MAX);
                            $log.log("retrying xhr counter %o config %o", counter, response.config); 
                            doRequest(); 
                        }, RETRY_WAIT * counter);
                    }
                });
            }
            doRequest();

            return deferred.promise;
        }
    };
}]);

tacoApp.factory('RandomTacoService', ['$log', 'RequestService', function($log, RequestService){
    return {
        fetchTaco: function(url) {
            return RequestService.request(url || 'http://taco-randomizer.herokuapp.com/random/');
        }
    };
}]);

tacoApp.controller('TacoListController', function ($scope, $log) {
        $scope.tacos = [
            {
                name: 'korean beef tacos',
                description: 'Fully loaded Korean Beef Tacos with Bulgogi steak'
            }, {
                name: 'baja fish taco',
                description: 'Baja Fish Taco Recipe is super easy to make, healthy, and full of flavor'
            }, {
                name: 'grilled chicken steak',
                description: 'Marinated chicken thighs are grilled to perfection and served with warmed corn tortillas, pico de gallo, and cilantro'
            }
        ];
    })
    .controller('RandomTacoController', function($scope, $log, RandomTacoService){
        $scope.taco = {
            name: 'default'
        };

        $scope.status = "loading";

        RandomTacoService.fetchTaco()
        .then(function(taco){
            $log.log("taco got %o", taco);
            $scope.status = "success";
            $scope.taco = taco;
        }, function(err){
            $scope.status = "Error "+ err;
            $log.log("taco err %o", err);
        }, function(notification){
            $scope.status = "Notification: "+ notification;
            $log.log("notification %o", notification);
        });
    })
;
