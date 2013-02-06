'use strict';

/* Inyect the result status of the conection request event */
angular.module('fifoHooks', [], function($provide, $httpProvider) {

    $provide.factory('checkPermition', function($q, $rootScope) {

        $rootScope.loading = true;

        return function(promise) {
            return promise.then(
                function success (res) {
                    $rootScope.loading = false;
                    $rootScope.$broadcast('response', 200, res)
                    return res;
                },
                function error(res) {
                    $rootScope.loading = false;
                    $rootScope.$broadcast('response', res.status, res)
                    return $q.reject(res)
                }
            )
        }
    })

    $httpProvider.responseInterceptors.push('checkPermition');
})

/* Listen for the conection events, and do something with them. Its referenced from app.js. */
fifoApp.factory('hookListener', function($rootScope, $cookies, wiggle, user, status) {

    $rootScope.$on('response', function(evt, statusCode, res) {
        if (statusCode < 300 || statusCode == 404) return;

        if (statusCode == 403) {

            //If the session is valid, its something with the permition
            return wiggle.sessions.get({id: $cookies["X-Snarl-Token"]},
                function success(data) {
                    console.log('Not allowed', statusCode, res.config)
                    return status.info('Not allowed')
                },
                function error() {
                    console.log('Invalid session. Logging out.')
                    return user.logout();
                })
        }

        status.info('There was an error. See the details in the js console')
        console.error('Error:', statusCode, res.config)
    })

})