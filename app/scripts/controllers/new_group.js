'use strict';

fifoApp.controller('NewGroupCtrl', function($scope, $location, wiggle, status) {
    $scope.setTitle('New group')

    $scope.create_group = function() {
        var user = new wiggle.groups({name: $scope.name});
        user.$create({},
                     function() {
                         $location.path('/groups');
                     },
                     function() {
                         console.error('Create Package error:', data);
                         status.error('There was an error creating your package. See the javascript console.');
                     });
    };
});
