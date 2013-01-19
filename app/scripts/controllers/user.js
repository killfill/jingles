'use strict';

fifoApp.controller('UserCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;
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

    $scope.delete = function() {
        var name = $scope.user.name;
        var uuid = $scope.user.uuid;
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm VM Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete VM <b id="delete-uuid">' + name + " (" + uuid + ") </b> Are you 100% sure you really want to do this?</p><p>Clicking on Destroy here will mean this VM is gone forever!</p>"
        }, function() {
            status.update('Will user ' + name, {info: true});
            wiggle.users.delete({id: uuid},
                                function success(data, h) {
                                    $location.path('/users')
                                },
                                function error(data) {
                                    console.error('Delete VM error:', data);
                                    alert('There was an error deleting your vm. See the javascript console.');
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
