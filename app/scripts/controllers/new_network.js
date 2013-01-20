'use strict';

fifoApp.controller('NewNetworkCtrl', function($scope, $http, $location, howl, wiggle) {

    $scope.rules = [{}];



    $scope.create_network = function() {
        var network = new wiggle.ipranges({
            name: $scope.name,
            tag: $scope.tag,
            network: $scope.network,
            netmask: $scope.netmask,
            gateway: $scope.gateway,
            first: $scope.first,
            last: $scope.last
        });

        if ($scope.vlan)
            network.vlan = parseInt($scope.vlan, 10)

        network.$create({},
            function success(data, headers) {
                $location.path('/networks');
            },
            function error(data) {
                console.error('Create Network error:', data);
                alert('There was an error creating your network. See the javascript console.');
            }
        );
    }
})
