var tacoApp = angular.module('tacoApp', []);

tacoApp.factory('RandomTacoService', ['$http', '$q', '$log', function($http, $q, $log){
    return {
        fetchTaco: function(config) {
            var counter = 0;
            var deferred = $q.defer();

            // amount of time to wait between retries
            var RETRY_WAIT = 1000 * 3;

            // maximum retry count
            var RETRY_MAX = 3;

            // allow configuration to be overwritten as a config param
            var config = angular.extend({
                url: 'http://taco-randomizer.herokuapp.com/random/',
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
                        /* deferred.reject(response.data.errors); */
                        $log.log("Resolving response %o", response);
                        deferred.resolve(response.data);
                    } else {
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
                            $log.log("retrying taco counter %o config %o", counter, response.config); 
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

        $scope.statusText = "loading";

        //RandomTacoService.fetchTaco({ 'url': "http://localhost/x" })
        RandomTacoService.fetchTaco()
        .then(function(taco){
            $log.log("taco got %o", taco);
            $scope.statusText = "success";
            $scope.taco = taco;
            return taco;
        }, function(err){
            $log.log("taco err %o", err);
        });
    })
;
