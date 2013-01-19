'use strict';

fifoApp.factory('user', function($rootScope, $compile, $cookies, $http, wiggle, howl) {

    return {
        logged: function() {

        },

        login: function(token, login) {

            /* Cookies */
            $cookies["X-Snarl-Token"] = token;
            $cookies.login = login;

            /* Logged data */
            $rootScope.loggedUser = {username: $cookies.login}
            $http.defaults.headers.common['X-Snarl-Token'] = $cookies.token;

            /* Pass the token to autenticate, and a list of vms to monitor */
            if ('WebSocket' in window) {
                wiggle.vms.list(howl.join)
                wiggle.hypervisors.list(howl.join)
                howl.connect($cookies["X-Snarl-Token"])
            }

        },

        logout: function() {
            delete $cookies["X-Snarl-Token"];
            delete $cookies.login;
            $rootScope.loggedUser = null;

            wiggle.cloud.get({controller: 'connection'}, function(res) {
                $rootScope.connectionStatus = {
                    ok: (res.howl > 0 && res.snarl > 0 && res.sniffle > 0),
                    services: res
                }
            })

        }
    }
})
