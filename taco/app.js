var tacoApp = angular.module('tacoApp', []);

tacoApp.factory('RandomTacoService', ['$http', '$q', function($http, $q){
    return {
        fetchTaco: function() {
            var counter = 0;
            var deferred = $q.defer();

            function getTaco() {
                $http({
                    // url: 'http://localhost/oink',
                    url: 'http://taco-randomizer.herokuapp.com/random/',
                    method: 'GET'
                })
                .success(function (taco){
                    deferred.resolve(taco);
                })
                .error(function (response){
                    console.log("error %o", response);
                    if (response && 
                        (response.status == -1 || response.status >= 500) && 
                        counter < 3
                    ) {
                        counter++;
                        setTimeout(function() { getTaco(); }, 3000 * counter);
                    }
                });
            }
            getTaco();

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
    .controller('RandomTacoController', function($scope, RandomTacoService){
        $scope.taco = {
            name: 'default'
        };

        $scope.statusText = "loading";
        console.log("taco service: %o", RandomTacoService);
        /*
        var taco = RandomTacoService.fetchTaco();
        console.log("Service fetch taco got %o", taco);
        taco.then(function(result){
            console.log("taco then: %o", result);
            $status.taco = result;
        });
        */
        var x = RandomTacoService.fetchTaco()
        .then(function(taco){
            console.log("controller got taco %o", taco);
            $scope.statusText = "success";
            $scope.taco = taco;
            return taco;
        });
        console.log("x %o", x);
    })
;
