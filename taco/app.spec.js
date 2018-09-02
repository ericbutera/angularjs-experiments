'use strict';
describe('TacoListController', function() {
    beforeEach(module('tacoApp'));
    it('should create a `tacos` model with 3 tacos', inject(function($controller) {
        var scope = {};
        var ctrl = $controller('TacoListController', {$scope: scope});
        expect(scope.tacos.length).toBe(3);
    }));
});
