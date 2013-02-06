'use strict';

fifoApp.controller('VmCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {

    var uuid = $routeParams.uuid;

    var set_metadata = function(key, value) {
        var o = {};
        o[key] = value;
        wiggle.vms.put({id: uuid,
                        controller: 'metadata',
                        second_id: 'jingles'},
                       o,
                       function success() {
                           $scope.vm.metadata.jingles[key] = value;
                       })
    };

    var get_metadata = function(key) {
        return $scope.vm.metadata.jingles[key];
    };

    $scope.packages = {};
    wiggle.packages.list(function(res) {
        res.forEach(function(pid) {
            $scope.packages[pid] = {
                name: pid,
                id: pid
            };
            wiggle.packages.get({id: pid}, function(pkg) {
                $scope.packages[pid] = pkg;

                /* Additional fields GET does not provide */
                $scope.packages[pid].id = pid;
                $scope.packages[pid].vcpus = pkg.cpu_cap/100;
                $scope.packages[pid].cpu_shares = pkg.ram;
            });
        });
    });

    var updateVm = function(cb) {
        wiggle.vms.get({id: uuid}, function(res) {
            $scope.vm = vmService.updateCustomFields(res);
            if (!$scope.vm.metadata)
                $scope.vm.metadata = {};
            if (!$scope.vm.metadata.jingles)
                $scope.vm.metadata.jingles = {};
            console.log($scope.vm.metadata.jingles.locked)
            var pkg =  "custom"
            if ($scope.vm["package"]) {
                pkg = $scope.vm["package"] + "";
            }
            if (! $scope.packages[pkg] ) {
                $scope.packages[pkg] = {
                    id: pkg,
                    name: $scope.vm._package && $scope.vm._package.name,
                    ram: $scope.vm.config.ram,
                    cpu_shares: $scope.vm.config.cpu_shares,
                    vcpus: $scope.vm.config.vcpus,
                    cpu_cap: $scope.vm.config.cpu_cap,
                    quota: $scope.vm.config.quota
                };
            };
            $scope.new_pkg = pkg;

            /* Build the snapshots array */
            $scope.snapshots = []
            Object.keys($scope.vm.snapshots|| []).forEach(function(k) {
                var val = $scope.vm.snapshots[k]
                val.uuid = k
                $scope.snapshots.push(val)
            })
            $scope.snapshots = $scope.vm.snapshots
            cb && cb($scope.vm)
        })
    }
    $scope.update = function() {
        wiggle.vms.put({id: $scope.vm.uuid}, {"package": $scope.new_pkg},
            function success() {
                status.info('Resizing ' + $scope.vm._name + '...')

                updateVm(function() {
                    $scope.vm.config.ram = ''
                    $scope.vm.config.vcpus = ''
                    $scope.vm.config.cpu_shares = ''
                    $scope.vm.config.cpu_cap = ''
                    $scope.vm.config.quota = ''
                })
                if ($scope.vm.config.type == 'kvm')
                    alert('Reboot on this machine is needed for resize to take effect')
        });
    };

    updateVm()

    $scope.$on('state', function(e, msg) {
        $scope.vm.state = msg.message.data
        vmService.updateCustomFields($scope.vm)
        updateVm()
        $scope.$apply()
    })

    $scope.$on('delete', function(e, msg) {
        $location.path('/virtual-machines')
        $scope.$apply()
    })

    $scope.$on('update', function(e, msg) {
        var vm = msg.message.data.config

        Object.keys(vm).forEach(function(k) {
            $scope.vm.config[k] = vm[k]
        })
        vmService.updateCustomFields($scope.vm);
        $scope.$apply()
    })

    $scope.action = function(action, vm) {
        vmService.executeAction(action, vm.uuid, vm.config && vm.config.alias, function() {
            if (action=='delete')
                $location.path('/virtual-machines')
        })
    }

    $scope.lock = function() {
        set_metadata('locked', ! get_metadata('locked'));
    }
    
    $scope.vnc = function(vm) {
        window.open("vnc.html?uuid=" + vm.uuid)
    }

    $scope.console = function(vm) {
        window.open("console.html?uuid=" + vm.uuid)
    }

    $scope.snapshot = function(action, snap) {
        switch (action) {

            case 'create':
                var comment = prompt('Write a comment for the new snapshot:');
                wiggle.vms.save({id: uuid, controller: 'snapshots'}, {comment: comment},
                    function success(data, h) {
                        status.info('Snapshot created');
                        updateVm()
                    },
                    function error(data) {
                        alert('Error saving the snapshot. See your console')
                        console.log(data)
                    });

                break;

            case 'delete':
                modal.confirm({
                    btnClass: 'btn-info',
                    btnText: 'Delete',
                    header: 'Confirm Snapshot Deletion',
                    body: '<p>Are you sure you want to delete snapshot <strong>' + snap.comment + '</strong> dated ' + new Date(snap.timestamp/1000) + '</p>'
                }, function() {
                    $scope.$apply()
                    wiggle.vms.delete({id: uuid, controller: 'snapshots', second_id: snap.uuid},
                        function success() {
                            status.info('Snapshot ' + snap.comment + ' deleted');
                            delete $scope.snapshots[snap.uuid]
                            updateVm()
                        },
                        function error(data) {
                            alert('Error deleting the snapshot. See your console')
                            console.log(data)
                        })
                })
                break;

            case 'rollback':
                modal.confirm({
                    btnClass: 'btn-danger btn-warning',
                    btnText: 'Rollback',
                    header: 'Confirm Rollback',
                    body: '<p><font color="red">Warning!</font> You are about to rollback to snapshot <strong>' + snap.comment + '</strong> dated ' + new Date(snap.timestamp/1000) + '?</p>' +
                        '<p>Please note: Any snapshots that have been taken after this rollback date will be deleted if you proceed.</p>' +
                        "</b>Are you 100% sure you really want to do this?</p>"
                }, function() {
                    status.info('Will rollback to snapshot ' + snap.comment);
                    $scope.$apply()
                    wiggle.vms.put({id: uuid, controller: 'snapshots', second_id: snap.uuid}, {action: 'rollback'},
                        function sucess () {
                            updateVm()
                            alert('Rollback done')
                        },
                        function error (data) {
                            alert('Error when rolling back. See the history')
                            console.log(data)
                        })
                })
                break;
        }

    }
});
