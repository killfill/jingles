'use strict';

angular.module('fifoApp')
.factory('auth', function ($rootScope, wiggle, $location, $route, $http, $cookies, howl) {

    //the logged user!
    var user;

    var auth = {

      currentUser: function() {
        return user
      },

      isLogged: function() {
        return !!user
      },

      login: function (_user, _pass) {

        wiggle.sessions.login(null, {user: _user, password: _pass},

          function success(res) {

            /* Create a user object based on the sessionData, so later we can use loggedUser.mdata_set */
            user = new wiggle.users(res)

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

    $rootScope.$on('$routeChangeStart', function(ev, next, current) {
      //On first load, current will be undefined.

      // console.log(current && current.$$route.controller, '->', next.$$route.controller, ev)
      checkIfLogged()
    })
    
    /* Separate the login check from the action taken: listen for auth events and do something */
    $rootScope.$on('auth:login_needed', function() {
      if ($location != '/login')
        auth.logout()
    })

    //Connect to howl, when use logs in.
    $rootScope.$on('auth:login_ok', function() {
      /* Pass the token to autenticate, and a list of vms to monitor */
      if ('WebSocket' in window) {
        wiggle.vms.list(howl.join)
        wiggle.hypervisors.list(howl.join)
        howl.connect($cookies["x-snarl-token"])
      }
    })

    // checkIfLogged()
    return auth;
  });
