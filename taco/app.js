var tacoApp = angular.module('tacoApp', []);

tacoApp.factory('DelayedGratificationService', ['$q', '$timeout', '$log', function($q, $timeout, $log){
    var base = function(name, success) {
        // generates a deferred that resolves at random times
        var deferred = $q.defer();
        var timeUntilResolve = _.random(1, 5);

        $log.log(name +" starting");
        $timeout(function(){
            $log.log(name +" finished");
            var res = {
                name: name,
                description: name + " time: " + timeUntilResolve,
                deferred: deferred
            };
            deferred.resolve(res);

            if (success) {
                success(res);
            }
        }, (1000 * timeUntilResolve));

        return deferred.promise;
    };

    return {
        one: function(success) { return base('one', success); },
        two: function(success) { return base('two', success); },
        three: function(success) { return base('three', success); },
        four: function(success) { return base('four', success); }
    }
}]);

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
});

tacoApp.controller('RandomTacoController', function($scope, $log, RandomTacoService){
    $scope.taco = {
        name: 'default'
    };

    $scope.GetTaco = function() {
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
    };

    $scope.status = "default";
    $scope.taco = {"condiment": {"name": "Chipotle Pineapple Sauce", "slug": "chipotle_pineapple_sauce", "url": "https://raw.github.com/sinker/tacofancy/master/condiments/chipotle_pineapple_sauce.md", "recipe": "Chipotle Pineapple Sauce\n\nIngredients\n\n    250 g chopped fresh pineapple\n    1 minced onion\n    15 ml olive oil\n    2-3 chipotle peppers, with surrounding adobo sauce from can\n    120 ml water\n\nDirections\n\n    Sautee the onion in the oil until translucent\n    Add pineapple and let cook for just a couple minutes\n    Add water and peppers and sauce and cook until reduced to just thinner than a paste\n\ntags: vegetarian, vegan\n"}, "mixin": {"name": "Corn Salad", "slug": "corn_salad", "url": "https://raw.github.com/sinker/tacofancy/master/mixins/Corn_Salad.md", "recipe": "Corn Salad\n==========\n\n* 2 Ears of corn\n* 1 Lime, juiced\n* Small handful of Cilantro, chopped\n* A few green onions, chopped\n* Garlic salt, or Garlic AND salt. I use Trader Joe's Garlic Salt in the grinder usually.\n\nCut the corn off of the cob, and in a mixing bowl mix together corn, lime juice, chopped cilantro and garlic salt. You can tweak any of this stuff as desired.\n\n---\nThis is my first Github commit. I'm glad it's taco related.\n\ntags: vegetarian, vegan\n"}, "seasoning": {"name": "Mahi Mahi Rub", "slug": "mahi_mahi_rub", "url": "https://raw.github.com/sinker/tacofancy/master/seasonings/mahimahirub.md", "recipe": "Mahi Mahi Rub\n==============\n\nA rub for Mahi Mahi, if fish tacos be what you're fancying:\n\n* 1 Part spicy chili powder\n* 1 Part salt\n* 1 Part ground cumin\n* 1/2 Part chopped cilantro\n* 1/2 Part cayenne\n* 1/2 Part pepper\n* 1/2 Part oregano\n* 1/2 Part onion powder\n* 1/2 Part garlic powder\n\nYou choose your measurements and enjoy!\n\ntags: vegetarian, vegan\n"}, "base_layer": {"name": "North Carolina Battered Catfish", "slug": "north_carolina_battered_catfish", "url": "https://raw.github.com/sinker/tacofancy/master/base_layers/battered_catfish.md", "recipe": "North Carolina Battered Catfish\n===============================\n\nDo it right and [stick your arm down a catfish hole in the muddy waters of a north carolina pond](http://www.youtube.com/watch?v=zc_huHb4PMc), take that sucker home at serve it up to your friends and family on some corn tortilas\n\n* 1 cup all-purpose flour\n* 1 cup cornmeal\n* 1 tablespoon baking powder\n* 1 tablespoon kosher salt\n* 1/2 teaspoon cayenne pepper\n* 1 (12-ounce) bottle amber beer\n* 4 (6-ounce) catfish fillets\n* 1 tablespoon salt\n* 1 tablespoon cracked black pepper\n* 2 tablespoons granulated garlic\n* 1 lemon, juiced\n\nPreheat a deep-fryer to 350 degrees Fahrenheit.\n\nIn a large bowl, add the flour, cornmeal, baking powder, salt and cayenne and whisk to combine. Whisk in the beer, being sure to remove any lumps.\n\nCut the catfish fillets in half lengthwise to make 2 strips. If desired, cut into bite-sized pieces. In a small bowl add the salt, pepper and granulated garlic. Season the fillets with the salt mixture.\n\nDip each strip in the beer batter and add to the fryer, a few at a time, moving them around so they don't stick. Fry until brown and crispy, about 3 to 4 minutes. Remove from the fryer to a serving platter. Repeat with the remaining fillets and season the fish with lemon juice. Cut them up into taco size portions and show your friends how amazing your catch tastes.\n"}, "shell": {"name": "bad-ass tortillas", "slug": "bad_ass_tortillas", "url": "https://raw.github.com/sinker/tacofancy/master/shells/homemade_tortillas.md", "recipe": "bad-ass tortillas\n=====================\n\nIf you are making tacos, don't settle for corporate store bought tortillas. Make your own like a real person!\n\nFirst get a cast iron pan:\n\n![](./pan.jpg)\n\nand then one of these bad-ass tortilla presses:\n\n![](./tortillador.jpg)\n\nBuy your lard from a place like this:\n\n![](./store.jpg)\n\n* 2 cups all purpose flour\n* 1/4 cup lard (cut into lil' pieces)\n* 1 teaspoon kosher salt\n* 2/3 tablespoon oil\n* 1/2 cup water (luke warm)\n\nMix all ingredients together except oil and water. Drizzle oil over mixture and mix with hands. Add water and mix and knead again until doughy. Let chill for about an hour in plastic wrappers.\n\nHeat large cast iron skillet (or something more authentic if you've got it) over medium heat. Cut dough into about 12 pieces that are round. Use a proper tortilla press (or something more authentic if you've got it) to make 'em flat and then put on the skillet. Wait until the transparent parts turn opaque and flip em. Put cooked tortillas in a *dirty* cloth napkin to keep 'em warm. End recipe. Paz, amor, y dinero.\n"}};
});

tacoApp.controller('DelayedGratificationController', function($scope, $q, $log, DelayedGratificationService){
    // This is an odd example of where I want to try to have 4 laggy data sources on the same page.
    // I also expect to be able to know when all are done but also each individual one too.
    $log.log("scope %o", $scope);

    $scope.status = 'Loading';
    $scope.one = 'loading...';
    $scope.two = 'loading...';
    $scope.three = 'loading...';
    $scope.four = 'loading...';

    $q.all([
        DelayedGratificationService.one(function() { $scope.one = '1 nom' + moment().format('h:mm:ss a'); }),
        DelayedGratificationService.two(function() { $scope.two = '2 nom' + moment().format('h:mm:ss a'); })
    ])
    .then(function(res){
        $log.log("adding two more: %o", res);
        res.push(DelayedGratificationService.three(function() { $scope.three = '3 nom' + moment().format('h:mm:ss a'); }));
        res.push(DelayedGratificationService.four(function() { $scope.four = '4 nom' + moment().format('h:mm:ss a'); }));
        return $q.all(res);
    })
    .then(function(result) {
        $log.log("q.all.then(%o)", result);
        $scope.status = "All nom'd out!";
    });

    /*
    DelayedGratificationService.one().then(function(res){ 
        console.log("one result %o", res); 
        $scope.one = res;
    });
    */
});

