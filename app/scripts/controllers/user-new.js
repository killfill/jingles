'use strict';

angular.module('fifoApp')
  .controller('UserNewCtrl', function ($scope, wiggle, $location, status) {

    $scope.create_user = function() {
        var user = new wiggle.users({user: $scope.name,
                                     password: $scope.pass1});
        user.$create({},
                    function() {
                        $location.path('/configuration/users');
                    },
                    function() {
                        console.error('Create Package error:', data);
                        status.error('There was an error creating your package. See the javascript console.');
                    });
    };
  });