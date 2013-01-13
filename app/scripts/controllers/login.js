'use strict';

fifoApp.controller('LoginCtrl', function($scope, wiggle, $route, user) {

    $scope.login = function() {

        wiggle.sessions.login(null, {user: $scope.username, password: $scope.password},
            function success(data){
                user.login(data.session, $scope.username);
                $scope.username = $scope.password = null;

                /* reload the current view */
                $route.reload()

            },
            function error(){
                $scope.loginError = "Invalid user"
                alert('Login failed. Try again')
            })

    }

    $scope.logout = function() {
        $scope.username = $scope.password = null;
        user.logout();
    }

});
