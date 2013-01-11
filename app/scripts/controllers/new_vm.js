'use strict';

fifoApp.controller('NewVmCtrl', function($scope, $http, $location, howl, wiggle) {

    $scope.create_machine = function() {
        var vm = new wiggle.vms({
            package: $scope.selectedPackage.name,
            dataset: $scope.selectedDataset.dataset,
            config: {
                networks: {},
                alias: $scope.name
            }
        })

        for (var i=0; i<$scope.selectedNetworks.length; i++) {
            vm.config.networks['net' + i] = $scope.selectedNetworks[i].name
        }

        vm.$save()

        $location.path('/virtual-machines')

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
                $scope.datasets.push(wiggle.datasets.get({id: id}))
            })
        })

        wiggle.packages.list(function(ids) {
            ids.forEach(function(id) {
                $scope.packages.push(wiggle.packages.get({id: id}))
            })
        })

        wiggle.ipranges.list(function(ids) {
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
