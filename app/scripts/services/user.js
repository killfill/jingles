'use strict';

fifoApp.factory('user', function($rootScope, $compile, $cookies, $http, wiggle, howl) {

    var hideTabs = function(perms) {

        var list = perms.map(function(i){ return i[0];});
        window.x = list;
        if (list.indexOf('...') > -1)
            return;

        $rootScope.hideTabs = list
    }

    return {
        logged: function() {

        },
        join: function(uuid, group) {
            wiggle.users.put({id: uuid,
                              controller: 'groups',
                              controller_id: group});
        },
        login: function(data) { //token, login) {

            /* Cookies */
            $cookies["X-Snarl-Token"] = data.session;
            $cookies.login = data.name;

            /* Logged data */
            $rootScope.loggedUser = data
            $http.defaults.headers.common['X-Snarl-Token'] = data.session;

            //hideTabs(data.permissions)

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
