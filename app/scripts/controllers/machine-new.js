'use strict';

angular.module('fifoApp').controller('MachineNewCtrl', function ($scope, wiggle, $location, status, auth, $q) {
   
    $scope.create_machine = function() {

        if ($scope.selectedNetworks.length != $scope.selectedDataset.networks.length) {
            status.error('Your network selection is invalid. ' +
                         'You have either too many or too fiew networks selected.');
            return;
        };

        //Add selected server to the rules array
        if ($scope.server)
            $scope.rules.push({weight: 'must', attribute: 'uuid', condition: '=:=', value: $scope.server.uuid})

        var vm = {
            package: $scope.selectedPackage.uuid,
            dataset: $scope.selectedDataset.dataset,
            config: {
                networks: {},
                metadata: {},
                alias: $scope.alias,
                hostname: $scope.hostname,
                ssh_keys: $scope.ssh_keys,
                requirements: $scope.rules,
                autoboot: $scope.autoboot
            }
        }

        //Passwords
        $scope.passwords.forEach(function(user) {
            if (user.pass)
                vm.config[ user.name + '_pw'] = user.pass
        })

        for (var i=0; i<$scope.selectedNetworks.length; i++) {
            vm.config.networks['net' + i] = $scope.selectedNetworks[i].uuid
        }

        if ($scope.resolver1)
            vm.config.resolvers = [$scope.resolver1];
        if ($scope.resolver2)
            vm.config.resolvers.push($scope.resolver2)

        if ($scope.userScript)
            vm.config.metadata['user-script'] = $scope.userScript

        $scope.metadata.forEach(function(h) {
            vm.config.metadata[h.key] = h.value;
        })

        //Check if use wants more than 1 vm:
        var match = $scope.alias.match(/\{(\d+)-(\d+)\}/)
        if (match) {
            var from = match[1],
                to = match[2]

            var calls = []
            for (var i=from; i<=to; i++) {
                var vmResource = new wiggle.vms(vm)
                vmResource.config.alias = vmResource.config.alias.replace(match[0], i)
                vmResource.config.hostname = vmResource.config.alias
                console.log('saving --> ', vmResource.config.alias)
                calls.push(vmResource.$save())
            }

            $q.all(calls).then(
                function ok(res) {
                    res.forEach(function(item) {
                        howl.join(item.uuid)
                    })
                    $location.path('/machines')
                },
                function error(res) {
                    console.error('Create VM error:', res)
                    status.error('There was an error creating your vms. See their logs or js console for details.')
                })
        }
        else
            //Just 1 VM
            new wiggle.vms(vm).$save().then(
                function ok(res){
                    howl.join(res.uuid)
                    $location.path('/machines')
                },
                function err(){
                    console.error('Create VM error:', res)
                    status.error('There was an error creating your VM. See its logs or js console for details.')
                }
            )
    }

    $scope.click_package = function(pkg) {
        $scope.selectedPackage = pkg
    }

    $scope.click_dataset = function(dataset) {

      /* Put a default machine alias name */
      if (!$scope.alias || ($scope.selectedDataset && $scope.alias == $scope.selectedDataset.name))
        $scope.alias = dataset.name

      $scope.selectedDataset = dataset

      $scope.passwords = dataset.users || [{name: 'root'}, {name: 'admin'}]

    }

    $scope.click_network = function(network) {
        var idx = $scope.selectedNetworks.indexOf(network)

        /* Toggle off */
        if (idx>-1)
            return $scope.selectedNetworks.splice(idx, 1)

        /* Limit nr of selected networks based on the database nr of networks */
        if ($scope.selectedNetworks.length >= $scope.selectedDataset.networks.length)
            $scope.selectedNetworks.splice(idx, 1)

        $scope.selectedNetworks.push(network)
    }

    $scope.metadata = []
    $scope.meta_action = function(action, idx) {
        switch (action) {
        case 'delete':
            $scope.metadata.splice(idx, 1)
            break;

        case 'create':
            status.prompt('Enter metadata key:', function(txt) {
                $scope.metadata.push({key: txt})
                $scope.$apply()
            })
            break;
        }
    }

    $scope.init = function() {

        $scope.datasets = []
        $scope.packages = []
        $scope.networks = []
        $scope.rules = [{}]
        $scope.autoboot = true
        $scope.user = auth.currentUser()

        /* Get the latest version of a dataset */
        $scope.latestDatasets = {}

        wiggle.datasets.list(function(ids) {

            if (ids.length<1) {
                status.error('Import a dataset first');
                return $location.path('/datasets')
            }

            ids.forEach(function(id) {
                wiggle.datasets.get({id: id}, function(res) {
                    if (res.imported != 1) return;

                    if (!$scope.latestDatasets[res.name] || $scope.latestDatasets[res.name] < res.version)
                        $scope.latestDatasets[res.name] = res.version

                    $scope.datasets.push(res)
                })
            })
        })

        wiggle.packages.list(function(ids) {

            if (ids.length<1) {
                status.error('Create a package first');
                return $location.path('/configuration/packages/new')
            }

            ids.forEach(function(id) {
                wiggle.packages.get({id: id},
                                    function(pack) {
                                        $scope.packages.push(pack)
                                        if (!$scope.selectedPackage)
                                            $scope.selectedPackage = pack
                                    }
                                   )
            })
        })

        wiggle.networks.list(function(ids) {

            if (ids.length<1) {
                status.error('Please create a new network');
                return $location.path('/configuration/networks/new')
            }

            ids.forEach(function(id) {
                wiggle.networks.get({id: id}, function(res) {

                    //If no iprange is asosiated with the network, ignore it.
                    if (!res.ipranges || res.ipranges.length < 1) return;
                    
                    $scope.networks.push(res)
                    if (!$scope.selectedNetworks)
                        $scope.selectedNetworks = [res]
                })
            })
        })

        wiggle.hypervisors.list(function(ids) {
            $scope.servers = ids.map(function(id) {
                return wiggle.hypervisors.get({id: id})
            })
        })

        $scope.$watch('alias', function(newVal, oldVal) {
            if (!$scope.hostname || $scope.hostname == oldVal)
                $scope.hostname = newVal
        })

    }

    $scope.init()

});
