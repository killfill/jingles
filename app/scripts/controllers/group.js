'use strict';

fifoApp.controller('GroupCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;
    $scope.p2 = false;
    $scope.p3 = false;

    wiggle.groups.get({id: uuid}, function(res) {
        $scope.group = res;
        $scope.permissions = res.permissions.map(function(p) {
            return {
                text: p.join("->"),
                obj: p
            };
        });
    });

    $scope.delete_permission = function(permission) {
        var p = {controller: "permissions",
                 id: $scope.group.uuid};
        p.controller_id = permission[0];
        if (permission[1])
            p.controller_id1 = permission[1];
        if (permission[2])
            p.controller_id2 = permission[2];
        wiggle.groups.revoke(p, function success(){
            $scope.permissions = $scope.permissions.filter(function (pobj) {
                return pobj.obj != permission;
            })
        });
    };

    $scope.grant = function() {
        $scope.permission.id = $scope.group.uuid;
        $scope.permission.controller = "permissions";

        wiggle.groups.grant($scope.permission, function () {
            console.log("Granted");
            var p = [$scope.permission.controller_id];
            if ($scope.permission.controller_id1)
                p.push($scope.permission.controller_id1);
            if ($scope.permission.controller_id2)
                p.push($scope.permission.controller_id2);
            $scope.permissions.push({obj: p, text: p.join("->")});
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
                    case "grous":
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
        var name = $scope.group.name;
        var uuid = $scope.group.uuid;
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm VM Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the Group <b id="delete-uuid">' + name + " (" + uuid + ") </b> Are you 100% sure you really want to do this?</p><p>Clicking on Destroy here will mean this Group is gone forever!</p>"
        }, function() {
            status.update('Will group ' + name, {info: true});
            wiggle.groups.delete({id: uuid},
                                 function success(data, h) {
                                     $location.path('/groups')
                                 },
                                 function error(data) {
                                     console.error('Delete Group error:', data);
                                     alert('There was an error deleting your group. See the javascript console.');
                                 });
        })
    };
});
