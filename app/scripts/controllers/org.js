'use strict';

fifoApp.controller('OrgCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    $scope.setTitle('Org details')
    $scope.groups = {}
    $scope.group = "";
    $scope.permission = "";
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

    wiggle.orgs.get({id: uuid}, function(res) {
        $scope.org = res;
    });
    $scope.add_trigger = function() {
        console.log("group",$scope.group);
        console.log("perm", $scope.permission);

        wiggle.orgs.put({
            id: uuid,
            controller: "triggers",
            controller_id: $scope.group,
            controller_id1: $scope.permission
        }, function success() {
            wiggle.orgs.get({id: uuid}, function(res) {
                $scope.org = res;
            });
        });
    };
    $scope.delete_trigger = function(trigger) {
        var permission = trigger.permission.splice(0)
        var group = trigger.group;
        permission.shift();
        permission.shift();
        wiggle.orgs.delete({
            id: uuid,
            controller: "triggers",
            controller_id: group,
            controller_id1: permission[0]
        }, function success() {
            wiggle.orgs.get({id: uuid}, function(res) {
                $scope.org = res;
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
