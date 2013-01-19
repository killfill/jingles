'use strict';
var x;
fifoApp.controller('UserCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;
    $scope.p2 = false;
    $scope.p3 = false;

    wiggle.users.get({id: uuid}, function(res) {
        res.groups = res.groups || [];
        $scope.user = res; //vmService.updateCustomFields(res)
        $scope.permissions = [];
        $scope.user._groups = {};
        $scope.user.groups.map(function (gid){
            if ($scope.groups[gid]) {
                $scope.user._groups[gid] = $scope.groups[gid]
            } else {
                $scope.user._groups[gid] = {uuid: gid};
            }
        });
        $scope.permissions = res.permissions.map(function(p) {
            return {
                text: p.join("->"),
                obj: p
            };
        });
    });

    $scope.delete_permission = function(permission) {
        console.log(permission);
    };

    $scope.grant = function() {
        var perm_string = $scope.permission.controller;
        if ($scope.permission.controller_id)
            perm_string = perm_string + "->" + $scope.permission.controller_id;
        if ($scope.permission.controller_id2)
            perm_string = perm_string + "->" + $scope.permission.controller_id2;
        alert("This is just a demo so far, the permission created would be: " + perm_string);
        console.log($scope.permission);
    };
    $scope.perm_change = function(level) {
        delete $scope.permission;
        switch(level) {
        case 3:
            $scope.permission = {controller: $scope.perm1,
                                 controller_id: $scope.perm2,
                                 controller_id2: $scope.perm3};

            break;
        case 1:
            $scope.p2 = false;
            $scope.p3 = false;
            switch($scope.perm1) {
            case "...":
                $scope.permission = {controller: "..."};
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
                    })
                });
                break;
            }
            break;
        case 2:
            $scope.p3 = false;
            if ($scope.perm2 == "...") {
                $scope.permission = {controller: $scope.perm1,
                                     controller_id: "..."};
            } else {
                switch($scope.perm1) {
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
