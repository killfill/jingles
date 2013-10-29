'use strict';

angular.module('fifoApp')
  .factory('datasetsat', function ($resource, $http) {
 
    var endpoint = "http://" + Config.datasets + "/"
    var services = {
        datasets: $resource(endpoint + 'datasets/:id',
                            {id: '@id'}),
    }

    /* Response with list of strings are not $resource friendly..
       https://groups.google.com/forum/#!msg/angular/QjhN9-UeBVM/UjSgc5CNDqMJ */
    endpoint = endpoint.replace("\\", '');
    ['datasets'].forEach(function(resource) {
        services[resource].list = function(cb, error) {

            /* This is another ugyly hack thanks to shared state and
             * mutable variables. There seems to be no way to not
             * send a header for just one request or service or resource ...
             */
            var token = $http.defaults.headers.common['x-snarl-token'];
            delete $http.defaults.headers.common['x-snarl-token'];
            var res = $http.get(endpoint + resource)
                .success(cb)
                .error(function(data) {
                    error && error(data)
                });
            $http.defaults.headers.common['x-snarl-token'] = token;

            return res
        }
    });

    /* Gets with cache! */
    services.datasets.get = function(obj, success, error) {
        var token = $http.defaults.headers.common['x-snarl-token'];
        delete $http.defaults.headers.common['x-snarl-token'];
        res = $http.get(endpoint + 'datasets/' + obj.id, {cache: true})
            .success(success)
            .error(function(data) {
                error && error(data)
            });
        $http.defaults.headers.common['x-snarl-token'] = token;
        return res;
    }
    return services

  });
