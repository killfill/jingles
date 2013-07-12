'use strict';
fifoApp.controller('OrgsCtrl', function($scope, wiggle, status) {
    $scope.setTitle('Orgs')
    $scope.orgs = {};
    $scope.show = function() {
        wiggle.orgs.list(function (ids) {
            ids.length > 0 && status.update('Loading users', {total: ids.length});
            ids.forEach(function(id) {
                $scope.orgs[id] = {name: id};
                wiggle.orgs.get({id: id}, function(res) {
                    $scope.orgs[id] = res;
                    status.update('Loading users', {add: 1});
                });
            });
        });
    };
    $scope.show();
});
