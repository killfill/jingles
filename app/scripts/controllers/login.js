'use strict';

fifoApp.controller('LoginCtrl', function($scope, wiggle, $route, user, status) {

    $scope.login = function() {

        wiggle.sessions.login(null, {user: $scope.username, password: $scope.password},
            function success(data){
                user.login(data);
                $scope.username = $scope.password = null;

                /* reload the current view */
                $route.reload()

            },
            function error(data){
                if (data && data.status == 403)
                    return status.error('Access denied. Try again');

                status.error('Error when loggin in. ' + (data && data.data))
            })
    }

    $scope.logout = function() {
        $scope.username = $scope.password = null;
        user.logout();
    }

});
