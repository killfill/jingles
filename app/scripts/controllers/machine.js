'use strict';

angular.module('fifoApp')
  .controller('MachineCtrl', function($scope, $routeParams, $location, wiggle, vmService, status) {

    // $scope.setTitle('Machine details')
    $scope.force = false;
    var uuid = $routeParams.uuid;
    var inc_version = function inc_version(v) {
        if (!v) return v;
        var a = v.split('.').map(function(e) {return parseInt(e)});
        a[a.length - 1] = a[a.length - 1] + 1;
        return a.join(".");
    }

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


    $scope.$on('$destroy', function(e, msg) {
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
        if (msg.channel != uuid) return; //not for us..
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
        if (msg.channel != uuid) return; //not for us..
        var data = msg.message.data;
        ops_chart.add([data.reads, data.writes]);
        throughtput_chart.add([data.nread, data.nwritten]);
    });

    $scope.$on('memstat', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..
        var data = msg.message.data;
        mem_chart.add([data.physcap, data.rss]);
        swap_chart.add([data.swapcap, data.swap]);

    });

    $scope.$on('cpu', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..
        var data = msg.message.data;
        cpu_chart.add([data.usage, data.value]);
    });

    var updateVm = function(cb) {
        wiggle.vms.get({id: uuid}, function success(res) {
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

            //Merge snapshots + backups  in 1 object. TODO: replace these loops with something more elegant...
            $scope.timeline = {}
            var source
            for (var k in source = $scope.vm.backups || {}) {
                if (!source.hasOwnProperty(k)) return;
                source[k].type = 'backup'
                $scope.timeline[k] = source[k]
            }
            for (var k in source = $scope.vm.snapshots || {}) {
                if (!source.hasOwnProperty(k)) return;
                source[k].type = 'snapshot'
                $scope.timeline[k] = source[k]
            }

            cb && cb($scope.vm);
            $scope.img_name = $scope.vm.config.alias;
            $scope.img_version = inc_version($scope.vm.config._dataset && $scope.vm.config._dataset.version);
            $scope.img_os = $scope.vm.config._dataset && $scope.vm.config._dataset.os;
            $scope.img_desc = $scope.vm.config._dataset && $scope.vm.config._dataset.description;
        }, function error() {
            $scope.something_wrong = true;
        }
        )
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



    $scope.$on('state', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..
        $scope.vm.state = msg.message.data

        vmService.updateCustomFields($scope.vm)
        // updateVm()

        /* In case the vm was forced to stop, restore the force value */
        if ($scope.vm.state === 'stopped')
            $scope.force = false;

        $scope.$apply()
    })

    $scope.$on('delete', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..

        $location.path('/machines')
        $scope.$apply()
    })

    $scope.$on('update', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..

        var vm = msg.message.data.config

        Object.keys(vm).forEach(function(k) {
            $scope.vm.config[k] = vm[k]
        })
        vmService.updateCustomFields($scope.vm);
        $scope.$apply()
    })

    $scope.$on('log', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..
        //data: {date: timestamp, log: text}.
        // console.log('[log evt]', msg.message.data)
        $scope.vm.log.push(msg.message.data)
        $scope.$apply()
    })

    $scope.$on('backup', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..
        var d = msg.message.data

        switch (d.action) {

            case 'update':
                var b = $scope.timeline[d.uuid]
                if (d.data.size) b.size = d.data.size
                if (d.data.state) b.state = d.data.state
                if (typeof d.data.local != 'undefined') b.local = d.data.local
                break;

            default:
                console.log('Unknown backup event:', d)

        }

        $scope.$apply()

    })
    $scope.$on('snapshot', function(e, msg) {
        if (msg.channel != uuid) return; //not for us..
        var d = msg.message.data;

        switch (d.action) {

            case 'deleted':
                delete $scope.timeline[d.uuid]
                status.success('Snapshot deleted')
                break;

            case 'rollback':
                updateVm()
                status.success("Rolled back successfully")
                break;

            default:
                var snap = $scope.timeline[d.uuid]
                snap.state = d.action
                snap.message = d.message
        }

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

        //Check if we need to change the owner.
        // if ($scope.new_owner && $scope.new_owner.uuid != $scope.vm.owner)
            wiggle.vms.put({id: $scope.vm.uuid, controller: 'owner'}, {org: $scope.new_owner && $scope.new_owner.uuid}, 
                function success() {
                    status.info('Owner changed')
                    $scope.vm._owner = $scope.new_owner
                },
                function error(err) {
                    status.error('Could not change owner')
                    console.error(err)
                }
            )

        wiggle.vms.put({id: $scope.vm.uuid}, {config: config},
                       function success() {
                           status.info('Config changed')
                           $scope.vm.config.alias = h.alias;
                       }
                      )

    }

    $scope.primary_nic = function primary_nic(vm, mac) {
        wiggle.vms.put({id: vm.uuid, controller: 'nics', controller_id: mac}, {primary: true},
                       function sucess () {
                           status.success('Primary NIC changed.')
                           updateVm()
                       },
                       function error (data) {
                           status.error('Error when changing the primary nic. See the history')
                           console.log(data)
                       })
    };

    $scope.remove_nic = function remove_nic(vm, mac) {
        wiggle.vms.delete(
            {id: vm.uuid, controller: 'nics', controller_id: mac},
            function success() {
                updateVm()
                status.success('NIC ' + mac + ' deleted');
            },
            function error(data) {
                status.error('Error deleting the nic. See your console')
                console.log(data)
            })
    };

    $scope.add_nic = function add_nic(vm, network) {
        wiggle.vms.save({id: vm.uuid, controller: 'nics'},
                        {network: network},
                        function success(data, h) {
                            status.success('NIC added.');
                            updateVm()
                            $('#VMTab a[href="#details"]').tab('show');
                        },
                        function error(data) {
                            status.error('Error creating NIC. See your console')
                            console.log(data)
                        });

    }

    $scope.action = function(action, vm) {

        /* If the machine didnt stopped, let the user force */
        if (action == 'stop') {
            setTimeout(function() {
                if ($scope.vm.state != 'running')
                    return;
                $scope.force = true;
                $scope.$apply()
            }, Config.timeForceButton * 1000);
        }

        vmService.executeAction(action, vm.uuid, vm.config && vm.config.alias, $scope.force, function() {
            if (action=='delete')
                $location.path('/machines')
        })
    }

    $scope.confirm_delete = function(vm) {
        $scope.modal = {
            title: 'Confirm VM Deletion',
            btnClass: 'btn-danger',
            confirm: 'Delete',
            body: '<p><font color="red">Warning!</font> you are about to delete VM <b id="delete-uuid">' + vm.uuid + " "+ (vm.config && vm.config.alias? '(' + vm.config.alias + ')': '') + "</b> Are you 100% sure you really want to do this?</p><p>Clicking on Delete here will mean this VM is gone forever!</p>",
            ok: function() {
                $scope.action('delete', vm);
            }
        }
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

                $scope.vm.mdata_set({notes: $scope.notes}, function() {
                    status.success('Note created')
                    $scope.notes.splice(0, 0, {text: txt, created_at: new Date()})
                })

            })
            break;

        case 'delete':
            $scope.notes.splice(idx, 1)
            $scope.vm.mdata_set({notes: $scope.notes}, function() {
                status.success('Note deleted')
            })

            break;
        }

    }

    $scope.timelineAction = function(action, obj) {

        switch (obj.type) {
            case 'snapshot':
                snapshotAction(action, obj)
                break

            case 'backup':
                backupAction(action, obj)
                break
        }
    }

    //Actions for backups
    var backupAction = function(action, obj) {
        switch (action) {

            case 'create':
                status.prompt('Write a comment for the new backup:', function(comment) {
                    body = {comment: comment};
                    if (obj.parent) {
                        body.parrent = obj.parent
                        body['delete'] = true
                    }
                    wiggle.vms.save({id: uuid, controller: 'backups'}, body,
                        function success(data, h) {
                            data.type = 'backup'
                            $scope.timeline[data.uuid] = data
                        },
                        function error(data, h) {
                            status.error('Could not create. See your console')
                            console.error(data)
                        }
                    )
                })
                break;

            case 'delete':
                $scope.modal = {
                    confirm: 'Delete',
                    title: 'Confirm Backup Deletion',
                    body: '<p>Are you sure you want to delete backup <strong>' + obj.comment + '</strong> dated ' + new Date(obj.timestamp/1000) + '</p>',
                    ok: function() {
                        wiggle.vms.delete({id: uuid, controller: 'backups', controller_id: obj._key},
                            function success(){
                                $scope.timeline[obj._key].state = 'deleting'
                            },
                            function error(data){
                                status.error('Could not delete. See your console')
                                console.error(data)
                            }
                        )
                    }
                }
                break;

            case 'rollback':

                $scope.modal = {
                    confirm: 'Rollback',
                    btnClass: 'btn-danger',
                    title: 'Confirm Rollback',
                    body: '<p><font color="red">Warning!</font> You are about to rollback to backup <strong>' + obj.comment + '</strong> dated ' + new Date(obj.timestamp/1000) + '?</p>' +
                        '<p>Please note: Any backups that have been taken after this rollback date will be deleted if you proceed.</p>' +
                        "</b>Are you 100% sure you really want to do this?</p>",
                    ok: function() {
                        status.info('Will rollback to backup ' + obj.comment);
                        wiggle.vms.put({id: uuid, controller: 'backups', controller_id: obj._key}, {action: 'rollback'},
                           function success(data) {
                                $scope.timeline[obj.uuid].state='rolling...'
                           },
                           function error(data) {
                               status.error('Error when rolling back. See the history')
                               console.log(data)
                           })
                    }
                }
                break;
        }
    }

    //Actions for snapshots
    var snapshotAction = function(action, snap) {
        switch (action) {

        case 'create':
            status.prompt('Write a comment for the new snapshot:', function(comment) {
                wiggle.vms.save({id: uuid, controller: 'snapshots'}, {comment: comment},
                                function success(data, h) {
                                    data.type = 'snapshot'
                                        $scope.timeline[data.uuid] = data
                                },
                                function error(data) {
                                    status.error('Could not save. See your console')
                                    console.error(data)
                                });
            });
            break;

        case 'delete':

            $scope.modal = {
                confirm: 'Delete',
                title: 'Confirm Snapshot Deletion',
                body: '<p>Are you sure you want to delete snapshot <strong>' + snap.comment + '</strong> dated ' + new Date(snap.timestamp/1000) + '</p>',
                ok: function() {
                     wiggle.vms.delete({id: uuid, controller: 'snapshots', controller_id: snap._key},
                      function success() {
                        $scope.timeline[snap._key].state = 'deleting'
                      },
                      function error(data) {
                        status.error('Could not delete. See your console')
                        console.error(data)
                    })
                }
            }
            break;

        case 'rollback':

            $scope.modal = {
                confirm: 'Rollback',
                btnClass: 'btn-danger',
                title: 'Confirm Rollback',
                body: '<p><font color="red">Warning!</font> You are about to rollback to snapshot <strong>' + snap.comment + '</strong> dated ' + new Date(snap.timestamp/1000) + '?</p>' +
                    '<p>Please note: Any snapshots that have been taken after this rollback date will be deleted if you proceed.</p>' +
                    "</b>Are you 100% sure you really want to do this?</p>",
                ok: function() {
                    status.info('Will rollback to snapshot ' + snap.comment);
                    wiggle.vms.put({id: uuid, controller: 'snapshots', controller_id: snap._key}, {action: 'rollback'},
                       function success(data) {
                            $scope.timeline[snap.uuid].state='rolling...'
                       },
                       function error(data) {
                           status.error('Error when rolling back. See the history')
                           console.log(data)
                       })
                }
            }
            break;
        }

    }

    $scope.import_dataset = function() {
        var url = 'http://' + Config.datasets + '/datasets/' + $scope.vm.config.dataset;
        wiggle.datasets.import(
            {},
            {url: url},
            function(r) {
                howl.join(uuid);
                status.info('Importing ' + r.name + ' ' + r.version);
                updateVm();
            });
    }
    $scope.mk_image = function mk_image(vm, snap) {
        var config = {
            name: $scope.img_name,
            version: $scope.img_version,
            os: $scope.img_os,
            description: $scope.img_desc
        };
        wiggle.datasets.import(
            {},
            {config: config,
             snapshot: snap,
             vm: vm},
            function(r) {
                howl.join(uuid);
                status.info('Creating ' + r.name + ' ' + r.version);
                updateVm();
            });
        console.log(vm + "@" + snap, config);
    }


    var init = function() {
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

        $scope.networks = {};
        wiggle.networks.list(function(res) {
            res.forEach(function(pid) {
                $scope.networks[pid] = {
                    name: pid,
                    id: pid
                };
                wiggle.networks.get({id: pid}, function(pkg) {
                    $scope.networks[pid] = pkg;

                    /* Additional fields GET does not provide */
                    $scope.networks[pid].id = pid;
                });
            });
        });

        $scope.orgs = []
        wiggle.orgs.list(function(ids) {
            ids.forEach(function(id) {
                wiggle.orgs.get({id: id}, function(org) {
                    $scope.orgs[id] = org;
                });
            });
        });


        howl.join(uuid + '-metrics');
        updateVm()

    }

    // TODO:
    // $scope.$on('user_login', init)
    // if (user.logged()) init()

    init();

});
