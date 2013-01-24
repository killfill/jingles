'use strict';

angular.module('fifoHooks', [], function($provide, $httpProvider) {

    $provide.factory('checkPermition', function($q, $rootScope) {

        $rootScope.loading = true;

        return function(promise) {
            return promise.then(
                function success (res) {
                    $rootScope.loading = false;
                    return res;
                },
                function error(res) {
                    $rootScope.loading = false;
                    if (res.status == 403) {
                        var err = 'You dont have permission to ' + res.config.method + ' ' + res.config.url;
                        console.log(err)

                    }
                    return $q.reject(res)
                }
            )
        }
    })

    $httpProvider.responseInterceptors.push('checkPermition');
})