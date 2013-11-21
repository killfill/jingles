'use strict';

angular.module('fifoApp')
  .controller('GroupNewCtrl', function ($scope, $location, wiggle, status) {

    $scope.create_group = function() {
        var user = new wiggle.groups({name: $scope.name});
        user.$create({},
                     function() {
                         $location.path('/configuration/groups');
                     },
                     function() {
                         console.error('Create Package error:', data);
                         status.error('There was an error creating your package. See the javascript console.');
                     });
    };
  });
