'use strict';

angular.module('fifoApp')
  .controller('GroupsCtrl', function ($scope, wiggle) {

    $scope.groups = {};
    $scope.show = function() {
        wiggle.groups.list(function (ids) {
            ids.forEach(function(id) {
                $scope.groups[id] = {name: id};
                wiggle.groups.get({id: id}, function(res) {
                    $scope.groups[id] = res;
                });
            });
        });
    };
    $scope.show();
  });
