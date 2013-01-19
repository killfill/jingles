'use strict';

fifoApp.controller('UserCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;
    wiggle.users.get({id: uuid}, function(res) {
        $scope.user = res; //vmService.updateCustomFields(res)
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

    $scope.leave_group = function(group) {
        console.log("delete:", $scope.group);
        wiggle.users.delete({id: $scope.user.uuid,
                             controller: 'groups',
                             controller_id: group});
    };

    $scope.group_join = function() {
        console.log("join:", $scope.group);
        wiggle.users.put({id: $scope.user.uuid,
                          controller: 'groups',
                          controller_id: $scope.group});
    };

    $scope.init = function() {
        $scope.groups = []
        wiggle.groups.list(function(ids) {
            ids.forEach(function(gid) {
                $scope.groups.push(gid);
            });
        })
    };
    $scope.init()
})
