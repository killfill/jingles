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

        vm.$save({},
            function success(data, headers) {
                howl.join(data.uuid);
                $location.path('/virtual-machines')
            },
            function error(data) {

                if (window.location.hostname == 'localhost' || Config.mode == 'dev') {
                    /*
                        After the vm is created wiggle response an 303 with the
                        Location header pointing at the URL of the created VM.
                        Within CORS (i.e. deleloping on the notebook pointing at a remote wiggle server)
                        The GET request the browser makes to get the VM data fails.
                        We cannot join its howl channel, so will not get state.
                        But t least ignore the error and goto the vm list.
                    */
                    console.log('DEV: Cannot join how channel of the created machine, you will need to Cmd+R :S')
                    return $location.path('/virtual-machines')
                }

                console.error('Create VM error:', data, data.headers())
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
                $scope.datasets.push(wiggle.datasets.get({id: id}))
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
