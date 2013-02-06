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
        get_metadata: function(key) {
            if (!$rootScope.loggedUser.metadata)
                $rootScope.loggedUser.metadata = {};
            if (!$rootScope.loggedUser.metadata.jingles)
                $rootScope.loggedUser.metadata.jingles = {};
            return $rootScope.loggedUser.metadata.jingles[key];
        },
        set_metadata: function(key, value) {
            if (!$rootScope.loggedUser.metadata)
                $rootScope.loggedUser.metadata = {};
            if (!$rootScope.loggedUser.metadata.jingles)
                $rootScope.loggedUser.metadata.jingles = {};
            var o = {};
            o[key] = value;
            wiggle.users.put({id:$rootScope.loggedUser.uuid,
                              controller: 'metadata',
                              controller_id: 'jingles'},
                             o,
                             function success(){
                                 $rootScope.loggedUser.metadata.jingles[key] = value;
                             });
        },
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

            clearInterval(connectionPoller);
        },

        logout: function() {
            delete $cookies["X-Snarl-Token"];
            delete $cookies.login;
            $rootScope.loggedUser = null;

            howl.disconnect();

            pollConnection();
            connectionPoller = setInterval(pollConnection, 5000)
        }
    }
})
