'use strict';

fifoApp.controller('NewIprangeCtrl', function($scope, $http, $location, howl, wiggle, status) {
    $scope.setTitle('New iprange')

    $scope.rules = [{}];

    function ip_to_int(S) {
        var P = S.split('.').map(function(N) {return parseInt(N)});
        var N = (P[0] << 24) + (P[1] << 16) + (P[2] << 8) + P[3];
        return N;
    }

    $scope.create_iprange = function() {
        var mask = ip_to_int($scope.netmask);
        var net = ip_to_int($scope.iprange);
        var gateway = ip_to_int($scope.gateway);
        var first = ip_to_int($scope.first);
        var last = ip_to_int($scope.last);
        var bc = net + ~mask;
        // Okay here is a lot of checking
        if ((net & mask) != net) {
            status.error("Iprange / Netmask combination is not valid!");
            return 1;
        }
        if ((gateway & mask) != net ||
            gateway == net) {
            status.error("Gateway is not in the iprange range!");
            return 1;
        }
        if ((first & mask) != net ||
            first == net) {
            status.error("First is not in the iprange range!");
            return 1;
        }
        if ((last & mask) != net ||
            last == net) {
            status.error("Last is not in the iprange range!");
            return 1;
        }
        if (first > last) {
            status.error("First has to be lower or equal to last!");
            return 1;
        }
        if (first <= gateway && gateway <= last) {
            status.error("The gateway is in between first and last, this can't work!");
            return 1;
        }
        if (gateway == bc) {
            status.error("The gateway equals the ipranges broadcast!");
            return 1;
        }
        if (last == bc) {
            status.error("The last equals the ipranges broadcast!");
            return 1;
        }
        var iprange = new wiggle.ipranges({
            name: $scope.name,
            tag: $scope.tag || 0,
            iprange: $scope.iprange,
            netmask: $scope.netmask,
            gateway: $scope.gateway,
            first: $scope.first,
            last: $scope.last
        });

        if ($scope.vlan)
            iprange.vlan = parseInt($scope.vlan, 10)

        iprange.$create({},
                        function success(data, headers) {
                            $location.path('/ipranges');
                        },
                        function error(data) {
                            switch (data.status){
                            case 409:
                                status.error("A iprange with this name already exists!");
                                break;
                            default:
                                console.error('Create Iprange error:', data);
                                status.error('There was an error creating your iprange. See the javascript console.');
                            }
                        }
                       );
    }

    /* Get all the available iprange tags to build the selector */
    $scope.iprange_tags = []
    wiggle.hypervisors.list(function(ids) {
        ids.forEach(function(id) {
            wiggle.hypervisors.get({id: id}, function(res) {
                res.ipranges && res.ipranges.forEach(function(net) {
                    if ($scope.iprange_tags.indexOf(net)<0)
                        $scope.iprange_tags.push(net)
                })

            })
        })
    })
})
