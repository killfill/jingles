'use strict';

fifoApp.controller('NewGroupCtrl', function($scope, $location, wiggle) {
    $scope.create_group = function() {
        var user = new wiggle.groups({name: $scope.name});
        user.$create({},
                     function() {
                         $location.path('/groups');
                     },
                     function() {
                         console.error('Create Package error:', data);
                         alert('There was an error creating your package. See the javascript console.');
                     });
    };
});
