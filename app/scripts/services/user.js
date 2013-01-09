'use strict';

fifoApp.factory('user', function($rootScope, $compile, $cookies, $http, wiggle, howl) {

    return {
        logged: function() {

        },

        login: function(token, login) {

            /* Cookies */
            $cookies.token = token;
            $cookies.login = login;

            /* Logged data */
            $rootScope.loggedUser = {username: $cookies.login}
            $http.defaults.headers.common['X-Snarl-Token'] = $cookies.token;

            /* Pass the token to autenticate, and a list of vms to monitor */
            if ('WebSocket' in window) {
                wiggle.vms.list(howl.join)
                wiggle.hypervisors.list(howl.join)
                howl.connect($cookies.token) 
            }

        },

        logout: function() {
            delete $cookies.token;
            delete $cookies.login;
            $rootScope.loggedUser = null;
        }
    }
})
