'use strict';

fifoApp.controller('NewPackageCtrl', function($scope, $http, $location, howl, wiggle) {

    $scope.rules = [{}];

    $scope.add_rule = function() {
        $scope.rules.push({})
    }

    $scope.rm_rule = function(idx) {
        $scope.rules.splice(idx, 1);
    }

    $scope.create_package = function() {
        var pkg = new wiggle.packages({
            quota: parseInt($scope.quota),
            ram: parseInt($scope.ram),
            cpu_cap: parseInt($scope.cpu_cap),
            requirements: $scope.rules
        });

        pkg.$create({id: $scope.name});
        $location.path('/packages')
    }
})
