'use strict';

/* Inyect the result status of the conection request event */
angular.module('fifoHooks', [], function($provide, $httpProvider) {

    $provide.factory('checkPermition', function($q, $rootScope) {

        $rootScope.loading = true;

        return function(promise) {
            return promise.then(function success (res) {
                $rootScope.loading = false;
                $rootScope.$broadcast('response', res.status, res)
                return res;
            },function error(res) {
                $rootScope.loading = false;
                $rootScope.$broadcast('response', res.status, res)
                return $q.reject(res)
            });
        }
    })

    $httpProvider.responseInterceptors.push('checkPermition');
})

/* Listen for the conection events, and do something with them. Its referenced from app.js. */
fifoApp.factory('hookListener', function($rootScope, $cookies, wiggle, user, status) {
    $rootScope.$on('response', function(evt, statusCode, res) {
        if (statusCode < 300 || statusCode == 404) return;

        switch (statusCode) {
        case 400:
            status.error('The request did contain invalid or incomplete data.');
            break;
        case 403:
            /* When user is loggin in, we could get a 403 (access denied..) */
            if (res.config.url.indexOf('sessions') > -1)
                return;
            //If the session is valid, its something with the permition
            return wiggle.sessions.get({id: $cookies["x-snarl-token"]}, function success(data) {
                console.log('Not allowed', statusCode, res.config)
                return status.info('Not allowed')
            }, function error() {
                console.log('Invalid session. Logging out.')
                return user.logout();
            });
            break;
        case 409:
            status.error('The request failed because of a data conflict.');
            break;
        case 503:
            status.error('Not all services are available.');
            break;
        case 505:
            status.error('There was an internal server error processing the request.<br/>' +
                         'See the details in the browsers javascript console.');
            console.error('Error:', statusCode, res.config);
            break
        default:
            status.error('There was an unexpected error. See the details in the js console');
            console.error('Error:', statusCode, res.config);
            break;
        };
    });
});
