'use strict';
fifoApp.controller('GroupsCtrl', function($scope, wiggle, status) {
    $scope.groups = {};
    $scope.show = function() {
        wiggle.groups.list(function (ids) {
            ids.length > 0 && status.update('Loading users', {total: ids.length});
            ids.forEach(function(id) {
                $scope.groups[id] = {name: id};
                wiggle.groups.get({id: id}, function(res) {
                    $scope.groups[id] = res;
                    status.update('Loading users', {add: 1});
                });
            });
        });
    };
    $scope.show();
});
