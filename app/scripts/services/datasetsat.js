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

            var res = $http.get(endpoint + resource)
                .success(cb)
                .error(function(data) {
                    error && error(data)
                });

            return res
        }
    });

    /* Gets with cache! */
    services.datasets.get = function(obj, success, error) {
        res = $http.get(endpoint + 'datasets/' + obj.id, {cache: true})
            .success(success)
            .error(function(data) {
                error && error(data)
            });
        return res;
    }
    return services

  });
