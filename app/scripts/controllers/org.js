'use strict';


function init_scope($scope, org) {
    $scope.org = org;
    $scope.grant_triggers = [];
    $scope.join_triggers = [];
    org.triggers.forEach(function (t) {
        var a = t.action;
        if (a == "group_grant" || a == "user_grant") {
            $scope.grant_triggers.push(t)
        } else if (a == "join_org" || a == "join_group") {
            $scope.join_triggers.push(t)
        }
    })
    return $scope;
};

fifoApp.controller('OrgCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    $scope.setTitle('Org details')
    $scope.groups = {}
    $scope.orgs = {}
    $scope.group = "";
    $scope.permission = "";
    $scope.grant_triggers = [];
    $scope.join_triggers = [];
    var uuid = $routeParams.uuid;

    wiggle.groups.list(function(ids) {
        ids.forEach(function(id) {
            $scope.groups[id] = {
                name: id,
                uuid: id
            };
            wiggle.groups.get({id: id}, function(grp) {
                $scope.groups[id] = grp;
            });
        });
    });

    wiggle.orgs.list(function(ids) {
        ids.forEach(function(id) {
            $scope.orgs[id] = {
                name: id,
                uuid: id
            };
            wiggle.orgs.get({id: id}, function(org) {
                $scope.orgs[id] = org;
            });
        });
    });

    wiggle.orgs.get({id: uuid}, function(res) {
        init_scope($scope, res)
    });

    $scope.add_grant_trigger = function() {
        wiggle.orgs.create({
            id: uuid,
            controller: "triggers",
            controller_id: "vm_create"
        }, {
            action: "group_grant",
            base: "vms",
            permission: [$scope.permission],
            target: $scope.grant_group
        }, function success() {
            wiggle.orgs.get({id: uuid}, function(res) {
                init_scope($scope, res)
            });
        });
    };

    $scope.delete_grant_trigger = function(trigger) {
        var permission = trigger.permission.splice(0);
        var group = trigger.target;
        var base = permission.shift();
        permission.shift();
        wiggle.orgs.delete({
            id: $scope.org.uuid,
            controller: "triggers",
            controller_id: trigger.trigger
        }, {
            action: trigger.action,
            base: "vms",
            permission: permission,
            target: trigger.target
        }, function success() {
            wiggle.orgs.get({id: uuid}, function(res) {
                init_scope($scope, res)
            });
        });
    };


    $scope.add_group_join_trigger = function() {
        console.log($scope.join_group)
        wiggle.orgs.create({
            id: uuid,
            controller: "triggers",
            controller_id: "user_create"
        }, {
            action: "join_group",
            target: $scope.join_group
        }, function success() {
            wiggle.orgs.get({id: uuid}, function(res) {
                init_scope($scope, res)
            });
        });

    };

    $scope.add_org_join_trigger = function() {
        wiggle.orgs.create({
            id: uuid,
            controller: "triggers",
            controller_id: "user_create"
        }, {
            action: "join_org",
            target: $scope.join_org
        }, function success() {
            wiggle.orgs.get({id: uuid}, function(res) {
                init_scope($scope, res)
            });
        });
    };

    $scope.delete_join_trigger = function(trigger) {
        console.log(trigger);
        wiggle.orgs.delete({
            id: $scope.org.uuid,
            controller: "triggers",
            controller_id: trigger.trigger
        }, {
            action: trigger.action,
            target: trigger.target
        }, function success() {
            wiggle.orgs.get({id: uuid}, function(res) {
                init_scope($scope, res)
            });
        });
    };


    $scope.delete = function() {
        var name = $scope.org.name;
        var uuid = $scope.org.uuid;
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm VM Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the Org <b id="delete-uuid">' + name + " (" + uuid + ") </b> Are you 100% sure you really want to do this?</p><p>Clicking on Delete here will mean this Org is gone forever!</p>"
        }, function() {
            wiggle.orgs.delete({id: uuid},
                               function success(data, h) {
                                   status.success(name + ' deleted');
                                   $location.path('/orgs')
                               },
                               function error(data) {
                                   console.error('Delete Org error:', data);
                                   status.error('There was an error deleting your org. See the javascript console.');
                               });
        })
    };
});
