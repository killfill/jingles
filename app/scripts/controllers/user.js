'use strict';

fifoApp.controller('UserCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;
    wiggle.users.get({id: uuid}, function(res) {
        $scope.user = res; //vmService.updateCustomFields(res)
        $scope.permissions = [];
        $scope.user._groups = {}
        res.groups.map(function (gid){
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
    $scope.init()
})
