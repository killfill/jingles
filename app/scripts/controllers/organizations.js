'use strict';

angular.module('fifoApp')
  .controller('OrganizationsCtrl', function ($scope, wiggle) {

    $scope.orgs = {};
    $scope.show = function() {
        wiggle.orgs.list(function (ids) {
            ids.forEach(function(id) {
                $scope.orgs[id] = {name: id};
                wiggle.orgs.get({id: id}, function(res) {
                    $scope.orgs[id] = res;
                });
            });
        });
    };
    $scope.show();

  });
