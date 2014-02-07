'use strict';

angular.module('fifoApp')
  .controller('PackageNewCtrl', function ($scope, wiggle, $location, status, utils) {

    $scope.create_package = function() {

        if ($scope.rules === false) {
            status.error('Some rules are not valid. Please fix them');
            return;
        }

        var pkg = new wiggle.packages({
            name: $scope.name,
            quota: parseInt($scope.quota),
            ram: parseInt($scope.ram),
            cpu_cap: parseInt($scope.cpu_cap),
            requirements: $scope.rules
        })

        var io = parseInt($scope.io, 10);
        if (io) pkg.zfs_io_priority = io;

        pkg.$create({}, function success(data, headers) {
            $location.path('/configuration/packages');
        }, function error(data) {
            console.error('Create Package error:', data);
            status.error('There was an error creating your package. See the javascript console.');
        });
    }

    $scope.rules;

  });
