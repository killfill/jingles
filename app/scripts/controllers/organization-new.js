'use strict';

angular.module('fifoApp')
  .controller('OrganizationNewCtrl', function ($scope, $location, status, wiggle) {

    $scope.create_org = function() {
        var user = new wiggle.orgs({name: $scope.name});
        user.$create({},
                     function() {
                         $location.path('/configuration/organizations');
                     },
                     function() {
                         console.error('Create Package error:', data);
                         status.error('There was an error creating your package. See the javascript console.');
                     });
    };
  });
