'use strict';

angular.module('fifoApp')
  .controller('UsersCtrl', function ($scope, wiggle) {

    $scope.users = {}

    $scope.show = function() {

        wiggle.users.list(function (ids) {
            $scope.users = ids.map(function(id) {return wiggle.users.getFull( {id: id}) } )
        });
    }

    $scope.show()

  });
