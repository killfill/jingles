'use strict';

angular.module('fifoApp')
  .controller('NetworkNewCtrl', function ($scope, wiggle, $location, status) {

    $scope.create_network = function() {
        var network = new wiggle.networks({
            name: $scope.name
        });

        network.$create(
            {},
            function success(data, headers) {
                $location.path('/configuration/networks');
            },
            function error(data) {
                switch (data.status){
                case 409:
                    status.error("A network with this name already exists!");
                    break;
                default:
                    console.error('Create Network error:', data);
                    status.error('There was an error creating your network. See the javascript console.');
                }
            }
        );
    }
  });
