'use strict';


fifoApp.controller('VmCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {

    $scope.setTitle('Machine details')
    $scope.force = false;
    var uuid = $routeParams.uuid;

    /* Get the all the packages */
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

    var throughtput_chart = new MetricsGraph("throughput", {
        unit: "KB/s",
        size: 60,
        series: [
            {scale: 1024,
             options: {
                 color: "#B6E7AC",
                 label: "read"
             }},
            {scale: 1024,
             options: {
                 color: "#69B3E4",
                 label: "write"
             }},
        ]});

    var ops_chart = new MetricsGraph("ops", {
        unit: "OPS/s",
        size: 60,
        series:[
            {options: {
                color: "#B6E7AC",
                label: "read"
            }},
            {options: {
                color: "#69B3E4",
                label: "write"
            }},
        ]});

    var mem_chart = new MetricsGraph("memory", {
        unit:"MB",
        size: 60,
        series: [
            {scale: 1024*1024,
             options: {
                 color: "#FFA455",
                 label: "cap"},
             type: "absolute"},
            {options: {
                color: "#9E9AC8",
                label: "RSS"},
             scale: 1024*1024,
             type: "absolute"},
        ]});

    var swap_chart = new MetricsGraph("swap", {
        unit:"MB",
        size: 60,
        series: [
            {color: "#FFA455",
             label: "cap",
             scale: 1024*1024,
             type: "absolute"},
            {color: "#9E9AC8",
             label: "used",
             scale: 1024*1024,
             type: "absolute"},
        ]});

    var cpu_chart = new MetricsGraph("cpu", {
        unit:"%",
        size: 60,
        min: 0,
        max: 150,
        series: [
            {options: {
                color: "#FFA455",
                label: "usage"},
             type: "absolute"},
            {options: {
                color: "#9E9AC8",
                label: "max"},
             type: "absolute"},
        ]});

    var netpkg_chart = {};

    var netdata_chart = {};

    howl.join(uuid + '-metrics');

    $scope.$on('$destroy', function() {
        howl.leave(uuid + '-metrics');
    });

    var make_nethtml = function (title, id) {
        var html =
            '<div class="perfbox pull-left">' +
            '<div class="header">' +
            '<span class="badge badge-info">' + title + '</span>'+
            '</div>'+
            '<div id="'+ id + '" class="metric"></div>'+
            '</div>';
        $("#performance").append(html);
    }
    $scope.$on('net', function(e, msg) {
        "Throughput";
        "Packages";
        var data = msg.message.data;
        var ifname = data.ifname;
        if (!netdata_chart[ifname]) {
            var id = "netdata_" + ifname;
            make_nethtml(ifname + ": Throughput", id);
            netdata_chart[ifname] = new MetricsGraph("" + id, {
                unit:"KB/s",
                size: 60,
                series: [
                    {options: {
                        color: "#B6E7AC",
                        label: "in KB/s"},
                     scale: 1024},
                    {options: {
                        color: "#69B3E4",
                        label: "out KB/s"},
                     scale: 1024},
                ]});
        }
        if (!netpkg_chart[ifname]) {
            var id = "netpkg_" + ifname;
            make_nethtml(ifname + ": Packets", id);
            netpkg_chart[ifname] = new MetricsGraph("" + id, {
                unit:"PKG/s",
                size: 60,
                series: [
                    {options: {
                        color: "#B6E7AC",
                        label: "in rate"}},
                    {options: {
                        color: "#69B3E4",
                        label: "out rate"}},
                    {options: {
                        color: "#D73027",
                        label: "in error/s"}},
                    {options: {
                        color: "#E16767",
                        label: "out error/s"}},
                ]});
        }
        netpkg_chart[ifname].add([data.ipackets64, data.opackets64, data.ierrors, data.oerrors]);
        netdata_chart[ifname].add([data.rbytes64, data.obytes64]);
    });

    $scope.$on('vfs', function(e, msg) {
        var data = msg.message.data;
        ops_chart.add([data.reads, data.writes]);
        throughtput_chart.add([data.nread, data.nwritten]);
    });

    $scope.$on('memstat', function(e, msg) {
        var data = msg.message.data;
        mem_chart.add([data.physcap, data.rss]);
        swap_chart.add([data.swapcap, data.swap]);

    });

    $scope.$on('cpu', function(e, msg) {
        var data = msg.message.data;
        cpu_chart.add([data.usage, data.value]);
    });

    var updateVm = function(cb) {
        wiggle.vms.get({id: uuid}, function(res) {
            $scope.vm = vmService.updateCustomFields(res);
            var pkg =  "custom"
            if ($scope.vm["package"]) {
                pkg = $scope.vm["package"] + "";
            }

            //If the vm has no config (i.e. failed-get_server state) ignore what continues
            if (!$scope.vm.config) return

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
            $scope.description = $scope.vm.mdata('description')
            $scope.configHash = angular.copy($scope.vm.config)
            $scope.color = $scope.vm.mdata('color')
            var _notes = $scope.vm.mdata('notes') && $scope.vm.mdata('notes').sort(function(a,b) { return a.created_at >= b.created_at; })
            $scope.notes = _notes? _notes.reverse() : []

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
                               status.error('Reboot on this machine is needed for resize to take effect')
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

    $scope.$watch('color', function(val) {
        if (typeof val === 'undefined' || !$scope.vm || val == $scope.vm.mdata('color')) return;
        $scope.vm.mdata_set({color: val})
        status.info('Color changed')
    })

    $scope.save_vm_info = function(h) {

        var config = {
            alias: h.alias,
            hostname: h.hostname,
            resolvers: h.resolvers && h.resolvers.toString().split(',')
        }

        if ($scope.description != $scope.vm.mdata('description')) {
            $scope.vm.mdata_set({description: $scope.description})
            status.info('Description changed')
        }

        var resolverOk  = true
        if (config.resolvers && config.resolvers.length > 0) {
            config.resolvers.forEach(function(ip) {
                resolverOk = resolverOk && ip.match(/^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/)
            })
        }
        if (!resolverOk)
            return status.error('Resolvers are not valid. Cannot save config.')

        wiggle.vms.put({id: $scope.vm.uuid}, {config: config},
                       function success() {
                           status.info('Config changed')
                           $scope.vm.config.alias = h.alias;
                       }
                      )


    }

    $scope.action = function(action, vm) {
        vmService.executeAction(action, vm.uuid, vm.config && vm.config.alias, $scope.force, function() {
            if (action=='delete')
                $location.path('/virtual-machines')
        })
    }

    $scope.lock = function() {
        $scope.vm.mdata_set({locked: !$scope.vm.mdata('locked')})
    }


    $scope.console = function(vm) {
        if (vm.config.type == 'kvm') {
            window.open("vnc.html?uuid=" + vm.uuid)
        } else {
            window.open("console.html?uuid=" + vm.uuid)
        }
    }

    $scope.notes = []
    $scope.note = function(action, idx) {

        switch(action) {

        case 'create':
            status.prompt('Enter your note:', function(txt) {
                $scope.notes.splice(0, 0, {text: txt, created_at: new Date()})
                $scope.vm.mdata_set({notes: $scope.notes})
                status.success('Note created')
            })
            break;

        case 'delete':
            $scope.notes.splice(idx, 1)
            $scope.vm.mdata_set({notes: $scope.notes})
            status.success('Note deleted')
            break;
        }

    }

    $scope.snapshot = function(action, snap) {
        switch (action) {

        case 'create':
            status.prompt('Write a comment for the new snapshot:', function(comment) {
                wiggle.vms.save({id: uuid, controller: 'snapshots'}, {comment: comment},
                                function success(data, h) {
                                    status.success('Snapshot created');
                                    updateVm()
                                },
                                function error(data) {
                                    status.error('Error saving the snapshot. See your console')
                                    console.log(data)
                                });
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
                wiggle.vms.delete({id: uuid, controller: 'snapshots', controller_id: snap.uuid},
                                  function success() {
                                      status.success('Snapshot ' + snap.comment + ' deleted');
                                      delete $scope.snapshots[snap.uuid]
                                      updateVm()
                                  },
                                  function error(data) {
                                      status.error('Error deleting the snapshot. See your console')
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
                wiggle.vms.put({id: uuid, controller: 'snapshots', controller_id: snap.uuid}, {action: 'rollback'},
                               function sucess () {
                                   updateVm()
                                   status.success('Rollback done')
                               },
                               function error (data) {
                                   status.error('Error when rolling back. See the history')
                                   console.log(data)
                               })
            })
            break;
        }

    }
});
