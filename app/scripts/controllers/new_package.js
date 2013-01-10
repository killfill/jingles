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
            quota: $scope.quota,
            ram: $scope.ram,
            cpu_cap: $scope.cpu_cap,
            rules: $scope.rules
        });

        pkg.$create({id: $scope.name});
        $location.path('/packages')
    }
})
