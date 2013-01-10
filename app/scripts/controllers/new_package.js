'use strict';

fifoApp.controller('NewPackageCtrl', function($scope, $http, $location, howl, wiggle) {

    $scope.create_package = function() {
        var pkg = new wiggle.packages({
            name: $scope.name,
            quota: $scope.quota,
            ram: $scope.ram,
            cpu_cap: $scope.cpu_cap
        });
        console.log(pkg);

/*        for (var i=0; i<$scope.selectedNetworks.length; i++)
            vm.config.networks['net' + i] = $scope.selectedNetworks[i].tag

        vm.$save()

        $location.path('/virtual-machines')
*/
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
            delete $scope.selectedNetworks[idx]
        else
            $scope.selectedNetworks.push(network)
    }

    $scope.init = function() {
    }

    $scope.init()
})
