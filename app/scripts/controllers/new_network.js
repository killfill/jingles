'use strict';

fifoApp.controller('NewNetworkCtrl', function($scope, $http, $location, howl, wiggle, status) {
    $scope.setTitle('New network')

    $scope.create_network = function() {
        console.log(wiggle)
        var network = new wiggle.networks({
            name: $scope.name
        });

        console.log(network);
        network.$create(
            {},
            function success(data, headers) {
                $location.path('/networks');
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
})
