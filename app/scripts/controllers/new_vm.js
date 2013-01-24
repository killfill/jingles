'use strict';

fifoApp.controller('NewVmCtrl', function($scope, $http, $location, howl, wiggle) {

    $scope.create_machine = function() {
        var vm = new wiggle.vms({
            package: $scope.selectedPackage.uuid,
            dataset: $scope.selectedDataset.dataset,
            config: {
                networks: {},
                alias: $scope.alias,
                root_pw: $scope.root_pw,
                admin_pw: $scope.admin_pw,
                hostname: $scope.hostname,
                resolvers: []
            }
        })

        for (var i=0; i<$scope.selectedNetworks.length; i++) {
            vm.config.networks['net' + i] = $scope.selectedNetworks[i].uuid
        }

        if ($scope.resolver1)
            vm.config.resolvers.push($scope.resolver1)
        if ($scope.resolver2)
            vm.config.resolvers.push($scope.resolver2)

        vm.$save({},
            function success(data, headers) {
                howl.join(data.uuid);
                $location.path('/virtual-machines')
            },
            function error(data) {
                console.error('Create VM error:', data, data.headers(), vm)
                alert('There was an error creating your vm. See the javascript console.')
            }
        )

    }

    $scope.click_package = function(pkg) {
        $scope.selectedPackage = pkg
    }

    $scope.click_dataset = function(dataset) {
        $scope.selectedDataset = dataset
    }

    $scope.click_network = function(network) {
        var idx = $scope.selectedNetworks.indexOf(network)
        if (idx>-1)
            $scope.selectedNetworks.splice(idx, 1)
        else
            $scope.selectedNetworks.push(network)
    }

    $scope.init = function() {

        $scope.datasets = []
        $scope.packages = []
        $scope.networks = []

        wiggle.datasets.list(function(ids) {
            ids.forEach(function(id) {
                wiggle.datasets.get({id: id}, function(res) {
                    $scope.datasets.push(res)
                })
            })
        })

        wiggle.packages.list(function(ids) {

            if (ids.length<1) {
                alert('Create a package first');
                return $location.path('/packages/new')
            }

            ids.forEach(function(id) {
                $scope.packages.push(wiggle.packages.get({id: id}))
            })
        })

        wiggle.ipranges.list(function(ids) {

            if (ids.length<1) {
                alert('Please create a network first');
                return $location.path('/networks/new')
            }

            ids.forEach(function(name) {
                var net = wiggle.ipranges.get({id: name})
                $scope.networks.push(net)
                if (!$scope.selectedNetworks)
                    $scope.selectedNetworks = [net]
            })
        })

    }

    $scope.init()
})
