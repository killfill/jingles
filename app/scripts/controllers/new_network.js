'use strict';

fifoApp.controller('NewNetworkCtrl', function($scope, $http, $location, howl, wiggle) {

    $scope.rules = [{}];

    function ip_to_int(S) {
        var P = S.split('.').map(function(N) {return parseInt(N)});
        var N = (P[0] << 24) + (P[1] << 16) + (P[2] << 8) + P[3];
        return N;
    }

    $scope.create_network = function() {
        var mask = ip_to_int($scope.netmask);
        var net = ip_to_int($scope.network);
        var gateway = ip_to_int($scope.gateway);
        var first = ip_to_int($scope.first);
        var last = ip_to_int($scope.last);
        var bc = net + ~mask;
        // Okay here is a lot of checking
        if ((net & mask) != net) {
            alert("Network / Netmask combination is not valid!");
            return 1;
        }
        if ((gateway & mask) != net ||
            gateway == net) {
            alert("Gateway is not in the netork range!");
            return 1;
        }
        if ((first & mask) != net ||
            first == net) {
            alert("First is not in the netork range!");
            return 1;
        }
        if ((last & mask) != net ||
            last == net) {
            alert("Last is not in the netork range!");
            return 1;
        }
        if (first > last) {
            alert("First has to be lower or equal to last!");
            return 1;
        }
        if (first <= gateway && gateway <= last) {
            alert("The gateway is inbetwen first and last, this can't work!");
            return 1;
        }
        if (gateway == bc) {
            alert("The gateway equals the networks broadcast!");
            return 1;
        }
        if (last == bc) {
            alert("The last equals the networks broadcast!");
            return 1;
        }
        var network = new wiggle.ipranges({
            name: $scope.name,
            tag: $scope.tag || 0,
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
                switch (data.status){
                    case 409:
                    alert("A network with this name already exists!");
                    break;
                    default:
                    console.error('Create Network error:', data);
                    alert('There was an error creating your network. See the javascript console.');
                }
            }
        );
    }
})
