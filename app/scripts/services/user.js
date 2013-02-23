'use strict';

fifoApp.factory('user', function($rootScope, $compile, $cookies, $http, wiggle, howl) {

    var hideTabs = function(perms) {

        var list = perms.map(function(i){ return i[0];});
        window.x = list;
        if (list.indexOf('...') > -1)
            return;

        $rootScope.hideTabs = list
    }

    var connectionPoller = false;
    var pollConnection = function() {
        wiggle.cloud.get({controller: 'connection'}, function(res) {
            $rootScope.connectionStatus = {
                ok: (res.howl > 0 && res.snarl > 0 && res.sniffle > 0),
                services: res
            }
        })
    }

    return {
        //2 Wrappers, becouse of JIN-27..
        mdata: function(k) {
            return $rootScope.loggedUser && $rootScope.loggedUser.mdata(k)
        },
        mdata_set: function(obj, cb) {
            return $rootScope.loggedUser && $rootScope.loggedUser.mdata_set(obj, cb)
        },

        logged: function() {
            return $rootScope.loggedUser
        },
        join: function(uuid, group) {
            wiggle.users.put({id: uuid,
                              controller: 'groups',
                              controller_id: group});
        },
        login: function(sessionData) { //token, login) {

            /* Access token */
            $cookies["X-Snarl-Token"] = sessionData.session;
            $http.defaults.headers.common['X-Snarl-Token'] = sessionData.session;

            /* Create a user object based on the sessionData, so later we can use loggedUser.mdata_set */
            $rootScope.loggedUser = new wiggle.users(sessionData)

            //hideTabs(sessionData.permissions)

            /* Pass the token to autenticate, and a list of vms to monitor */
            if ('WebSocket' in window) {
                wiggle.vms.list(howl.join)
                wiggle.hypervisors.list(howl.join)
                howl.connect($cookies["X-Snarl-Token"])
            }

            clearInterval(connectionPoller);
        },

        logout: function() {
            var session = $cookies["X-Snarl-Token"];
            delete $cookies["X-Snarl-Token"];
            session && wiggle.sessions.delete({id: session});

            $rootScope.loggedUser = null;

            howl.disconnect();

            pollConnection();
            connectionPoller = setInterval(pollConnection, 5000)
        }
    }
})
