'use strict';

fifoApp.controller('NewOrgCtrl', function($scope, $location, wiggle, status) {
    $scope.setTitle('New org')

    $scope.create_org = function() {
        var user = new wiggle.orgs({name: $scope.name});
        user.$create({},
                     function() {
                         $location.path('/orgs');
                     },
                     function() {
                         console.error('Create Package error:', data);
                         status.error('There was an error creating your package. See the javascript console.');
                     });
    };
});
