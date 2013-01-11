'use strict';

fifoApp.controller('NewPackageCtrl', function($scope, $location, wiggle) {

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

        pkg.$create({id: $scope.name},
            function success(data, headers) {
                $location.path('/packages')
            },
            function error(data) {
                console.error('Create Package error:', data)
                alert('There was an error creating your package. See the javascript console.')
            }
        );
    }
})
