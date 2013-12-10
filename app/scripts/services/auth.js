'use strict';

angular.module('fifoApp')
.factory('auth', function ($rootScope, wiggle, $location, $route, $http, $cookies, howl, $q) {

    var user
    var userLoggedDefer = $q.defer()

    function _canAcess(elementPerm, userPerm) {
      var ret = true;

      for (var i=0; i<elementPerm.length; i++) {
        var usPerm = userPerm[i],
          elPerm = elementPerm[i]

        if (usPerm == '...' || usPerm == '_') {
          return true; //everything or all
        }

        if (usPerm != elPerm) {
          ret = false;
          break;
        }
        
      }
      return ret;
    }

    var auth = {

      canAccess: function(elementPerm) {
        for (var i=0; i<user.permissions.length; i++) {
          if (_canAcess(elementPerm, user.permissions[i])) 
            return true
        }
        return false
      },

      currentUser: function() {
        return user
      },

      isLogged: function() {
        return !!user
      },

      userPromise: function() {
        return userLoggedDefer.promise
      },

      login: function (_user, _pass) {

        wiggle.sessions.login(null, {user: _user, password: _pass},

          function success(res) {

            /* Create a user object based on the sessionData, so later we can use loggedUser.mdata_set */
            user = new wiggle.users(res)
            user.keys = user.keys || []
            user.groups = user.groups || []

            $cookies["x-snarl-token"] = res.session
            //Wiggle see to read the cookie, now so setting the header is not neccesary anymore.
            //$http.defaults.headers.common['x-snarl-token'] = res.session || 'test_Session';
            $rootScope.$broadcast('auth:login_ok', user, res.session)
            $location.path('/')
          },

          function error(res) {
            $rootScope.$broadcast('auth:login_error', res)
          }
        )
      },

      logout: function() {
        user = null;

        var token = $cookies["x-snarl-token"]
        if (token) {
          wiggle.sessions.delete({id: token})
          delete $cookies["x-snarl-token"]

        }

        $rootScope.$broadcast('auth:logout')
        $location.path('/login')
        return;
      }
    };

    /* Watch for url changes and check if is logged */
    function checkIfLogged() {

      if (!auth.isLogged()) {

        //Chances are that session.get takes more time that the first change of route, so set a temporary user object
        user = new wiggle.users({status: 'waiting for login validation'})

        var token = $cookies["x-snarl-token"]
        if (!token)
          return $rootScope.$broadcast('auth:login_needed')

        //Check if the current token is valid.
        wiggle.sessions.get({id: token},
          function ok(res) {
            user = new wiggle.users(res)
            $rootScope.$broadcast('auth:login_ok', user, res.data)
          },
          function error() {
            $rootScope.$broadcast('auth:login_needed')
          }
        )
      }
    }

    $rootScope.$on('$routeChangeSuccess', function(ev, curr, prev) {
      //On first load, prev will be undefined.

      // console.log(prev && prev.$$route.controller, '->', curr.$$route.controller, ev)
      checkIfLogged()
    })
    
    /* Separate the login check from the action taken: listen for auth events and do something */
    $rootScope.$on('auth:login_needed', function() {
      if ($location != '/login')
        auth.logout()
    })

    //Connect to howl, when use logs in.
    $rootScope.$on('auth:login_ok', function() {

      userLoggedDefer.resolve(user)

      /* Pass the token to autenticate, and a list of vms to monitor */
      if ('WebSocket' in window) {
        wiggle.vms.list(howl.join)
        wiggle.hypervisors.list(howl.join)
        howl.connect($cookies["x-snarl-token"])
      }
    })

    //When loading /#/ changeRoute does not trigger so trigger it anyway.
    checkIfLogged()
    return auth;
  });
