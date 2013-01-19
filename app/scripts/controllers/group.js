'use strict';

fifoApp.controller('GroupCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;
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
        console.log(permission);
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
                                     $location.path('/users')
                                 },
                                 function error(data) {
                                     console.error('Delete Group error:', data);
                                     alert('There was an error deleting your group. See the javascript console.');
                                 });
        })
    };
});
