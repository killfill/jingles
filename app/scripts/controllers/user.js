'use strict';

fifoApp.controller('UserCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;
    $scope.p2 = false;
    $scope.p3 = false;


    var cache=(function(){
        var c = {};
        return function(entity, e, callback) {
            if (!c[entity])
                c[entity] = {};
            if (c[entity][e]) {
                callback(c[entity][e]);
            } else {
                wiggle[entity].get({id: e}, function(elem) {
                    c[entity][e] = elem;
                    callback(elem);
                })
            }
        }
    })();

    var update_permission = function(p) {
        var res = {
            text: p.join("->"),
            obj: p
        };
        var we_need_a_stupid_copy_thank_you_js = p.slice()
        if (p[1] && p[1] != "..." && p[1] != "_") {
            switch (p[0]) {
            case "users":
            case "groups":
            case "packages":
            case "ipranges":
                cache(p[0], p[1], function (e) {
                    we_need_a_stupid_copy_thank_you_js[1] = e.name;
                    res.text = we_need_a_stupid_copy_thank_you_js.join("->");
                })
                break;
            case "datasets":
                cache(p[0], p[1], function (e) {
                    if (e.name && e.version) {
                        we_need_a_stupid_copy_thank_you_js[1] = e.name + " (" + e.version + ")";
                        res.text = we_need_a_stupid_copy_thank_you_js.join("->");
                    }
                });
                break;
            case "vms":
                cache(p[0], p[1], function (e) {
                    if (e.config && e.config.alias) {
                        we_need_a_stupid_copy_thank_you_js[1] = e.config.alias + "(" + p[1] + ")";
                        res.text = we_need_a_stupid_copy_thank_you_js.join("->");
                    }
                })
                break;
            }
        }
        return res;
    };

    wiggle.users.get({id: uuid}, function(res) {
        res.groups = res.groups || [];
        $scope.user = res; //vmService.updateCustomFields(res)
        $scope.permissions = [];
        $scope.user._groups = {};
        $scope.user.groups.map(function (gid){
            if ($scope.groups[gid]) {
                $scope.user._groups[gid] = $scope.groups[gid];
            } else {
                $scope.user._groups[gid] = {uuid: gid};
            }
        });
        $scope.permissions = res.permissions.map(update_permission);
    });

    $scope.delete_permission = function(permission) {
        var p = {controller: "permissions",
                 id: $scope.user.uuid};
        p.controller_id = permission[0];
        if (permission[1])
            p.controller_id1 = permission[1];
        if (permission[2])
            p.controller_id2 = permission[2];
        wiggle.users.revoke(p, function success(){
            $scope.permissions = $scope.permissions.filter(function (pobj) {
                return pobj.obj != permission;
            })
        });
    };

    $scope.grant = function() {
        $scope.permission.id = $scope.user.uuid;
        $scope.permission.controller = "permissions";

        wiggle.users.grant($scope.permission, function () {
            console.log("Granted");
            var p = [$scope.permission.controller_id];
            if ($scope.permission.controller_id1)
                p.push($scope.permission.controller_id1);
            if ($scope.permission.controller_id2)
                p.push($scope.permission.controller_id2);
            $scope.permissions.push(update_permission(p));
        }, function(d) {
            console.log("failed:", d);
        });
        console.log($scope.permission);
    };
    $scope.perm_change = function(level) {
        delete $scope.permission;
        switch(level) {
        case 3:
            $scope.permission = {controller_id: $scope.perm1,
                                 controller_id1: $scope.perm2,
                                 controller_id2: $scope.perm3};

            break;
        case 1:
            $scope.p2 = false;
            $scope.p3 = false;
            $scope.perm2 = "";
            $scope.perm3 = "";
            switch($scope.perm1) {
            case "...":
                $scope.permission = {controller_id: "..."};
                break;
            case "cloud":
                $scope.p2 = {
                    "could": {id: "cloud", name: "Cloud"},
                    "users": {id: "users", name: "Users"},
                    "groups": {id: "groups", name: "Groups"},
                    "hypervisors": {id: "hypervisors", name: "Hypervisors"},
                    "vms": {id: "vms", name: "Virtual Machines"},
                    "ipranges": {id: "ipranges", name: "Networks"},
                    "datasets": {id: "datasets", name: "Datasets"},
                    "packages": {id: "packages", name: "Packages"}
                };
                break;
            case "users":
                wiggle.users.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Users"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.users.get({id: id}, function(user) {
                            $scope.p2[id].name = user.name;
                        })
                    })
                });
                break;
            case "groups":
                wiggle.groups.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Users"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.groups.get({id: id}, function(group) {
                            $scope.p2[id].name = group.name;
                        })
                    })
                });
                break;
            case "hypervisors":
                wiggle.hypervisors.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Hypervisors"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                    })
                });
                break;
            case "vms":
                wiggle.vms.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Virtual Machines"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.vms.get({id: id}, function(vm) {
                            var name = id;
                            if (vm.config && vm.config.alias)
                                name = name + " (" + vm.config.alias + ")";
                            $scope.p2[id].name = name;
                        })
                    })
                });
                break;
            case "datasets":
                wiggle.datasets.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Datasets"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.datasets.get({id: id}, function(ds) {
                            $scope.p2[id].name = ds.name + " " + ds.version;
                        })
                    })
                });
                break;
            case "packages":
                wiggle.packages.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Packages"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.packages.get({id: id}, function(ipr) {
                            $scope.p2[id].name = ipr.name + " (" + id + ")";
                        });

                    })
                });
                break;
            case "ipranges":
                wiggle.ipranges.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Networks"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.ipranges.get({id: id}, function(ipr) {
                            $scope.p2[id].name = ipr.name + " (" + id + ")";
                        });
                    })
                });
                break;
            }
            break;
        case 2:
            $scope.p3 = false;
            $scope.perm3 = "";
            if ($scope.perm2 == "...") {
                $scope.permission = {controller_id: $scope.perm1,
                                     controller_id1: "..."};
            } else {
                switch($scope.perm1) {
                case "cloud":
                    switch($scope.perm2) {
                    case "cloud":
                        $scope.p3 = [
                            {id: "status", name: "Status"}
                        ]
                        break;
                    case "users":
                    case "groups":
                    case "vms":
                    case "packages":
                    case "ipranges":
                        $scope.p3 = [
                            {id: "list", name: "List"},
                            {id: "create", name: "Create"}
                        ];
                        break;
                    case "datasets":
                    case "hypervisors":
                        $scope.p3 = [
                            {id: "list", name: "List"}
                        ]
                        break;
                    }
                    break;
                case "users":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"passwd", name: "Change Password"},
                        {id:"delete", name: "Delete"},
                        {id:"grant", name: "Grant a Permission"},
                        {id:"revoke", name: "Revoke a Permission"},
                        {id:"join", name: "Join a group"},
                        {id:"leave", name: "Leave a group"}
                    ];
                    break;
                case "groups":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"delete", name: "Delete"},
                        {id:"grant", name: "Grant a Permission"},
                        {id:"revoke", name: "Revoke a Permission"},
                        {id:"join", name: "Join this group"},
                        {id:"leave", name: "Leave this group"}
                    ];
                    break;
                case "vms":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"start", name: "Start"},
                        {id:"stop", name: "Stop"},
                        {id:"reboot", name: "Reboot"},
                        {id:"delete", name: "Delete"},
                        {id:"console", name: "Console/VNC"},
                        {id:"snapshot", name: "Create a Snapshot"},
                        {id:"rollback", name: "Rollback a Snapshot"},
                        {id:"delete_snapshot", name: "Delete a Snapshot"}
                    ];
                    break;
                case "hypervisors":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"create", name: "Create VM's here"},
                        {id:"edit", name: "Edit Metadata"}
                    ];
                    break;
                case "ipranges":
                case "packages":
                case "datasets":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"delete", name: "Delete"}
                    ];
                    break;
                }
                if ($scope.p3)
                    $scope.p3.unshift({'id': '...', name:'Everything'});
            }
        };
    };

    $scope.delete = function() {
        var name = $scope.user.name;
        var uuid = $scope.user.uuid;
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm VM Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the User <b id="delete-uuid">' + name + " (" + uuid + ") </b> Are you 100% sure you really want to do this?</p><p>Clicking on Destroy here will mean this User is gone forever!</p>"
        }, function() {
            status.update('Will user ' + name, {info: true});
            wiggle.users.delete({id: uuid},
                                function success(data, h) {
                                    $location.path('/users')
                                },
                                function error(data) {
                                    console.error('Delete User error:', data);
                                    alert('There was an error deleting your user. See the javascript console.');
                                });
        })
    };

    $scope.passwd = function () {
        if ($scope.pass1 == $scope.pass2) {
            wiggle.users.put({id: $scope.user.uuid},
                             {password: $scope.pass1},
                             function() {
                                 alert("Password for user " +
                                       $scope.user.name +
                                       " changed.");
                             });

        } else {
            alert("Passwords don't match!");
        }
    }

    $scope.leave_group = function(group) {
        console.log("delete:", $scope.group);
        wiggle.users.delete({id: $scope.user.uuid,
                             controller: 'groups',
                             controller_id: group},
                            function(){
                                delete $scope.user._groups[group];
                            });
    };

    $scope.group_join = function() {
        console.log("join:", $scope.group);
        wiggle.users.put({id: $scope.user.uuid,
                          controller: 'groups',
                          controller_id: $scope.group},
                         function() {
                             $scope.user._groups[$scope.group] = $scope.groups[$scope.group];
                         }
                        );
    };

    $scope.init = function() {
        $scope.pass1 = "";
        $scope.pass2 = "";
        $scope.groups = [];
        wiggle.groups.list(function(ids) {
            ids.forEach(function(gid) {
                wiggle.groups.get({id: gid}, function(g) {
                    $scope.groups[gid] = g;
                    if ($scope.user._groups[gid]) {
                        $scope.user._groups[gid] = g;
                    }
                });
            });
        })
    };
    $scope.init();
})
