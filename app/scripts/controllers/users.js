'use strict';

fifoApp.controller('UsersCtrl', function($scope, wiggle, status) {
    $scope.setTitle('Users')

    $scope.users = {}

    var group_cache=(function(){
        var groups = {};
        return function(g, callback) {
            if (groups[g]) {
                callback(groups[g]);
            } else {
                wiggle.groups.get({id: g}, function(group) {
                    groups[g] = group;
                    callback(group);
                })
            }
        }
    })();
    $scope.show = function() {
        wiggle.users.list(function (ids) {

            ids.length > 0 && status.update('Loading users', {total: ids.length})

            ids.forEach(function(id) {
                $scope.users[id] = {name: id}
                wiggle.users.get({id: id}, function(res) {
                    $scope.users[id] = addFields(res);
                    var gs = $scope.users[id].groups || [];
                    gs.forEach(function(g, i) {
                        group_cache(g, function(go) {
                            $scope.users[id].groups[i] = go.name;
                        });
                    });
                    status.update('Loading users', {add: 1});
                });
            });
        });
    }

    $scope.show()

    var addFields = function(u) {
        u._perm = u.permissions.map(function(P) {
            return P.join("->");
        }).join(", ")
        return u;
    }

});
