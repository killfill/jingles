'use strict';

fifoApp.factory('wiggle', function($resource, $http) {

    var endpoint = Config.wiggle.replace(':', '\\:')

    var services = {
        sessions: $resource(endpoint + 'sessions/:id',
                            {id: '@id'},
                            {login: {method: 'POST'}}),
        users: $resource(endpoint + 'users/:id/:controller/:controller_id/:controller_id1/:controller_id2',
                         {id: '@id',
                          controller: '@controller',
                          controller_id: '@controller_id',
                          controller_id1: '@controller_id1',
                          controller_id2: '@controller_id2'},
                         {put: {method: 'PUT'},
                          grant: {method: 'PUT'},
                          revoke: {method: 'DELETE'},
                          create: {method: 'POST'},
                          delete: {method: 'DELETE'}}),
        groups: $resource(endpoint + 'groups/:id/:controller/:controller_id/:controller_id1/:controller_id2',
                         {id: '@id',
                          controller: '@controller',
                          controller_id: '@controller_id',
                          controller_id1: '@controller_id1',
                          controller_id2: '@controller_id2'},
                         {put: {method: 'PUT'},
                          grant: {method: 'PUT'},
                          revoke: {method: 'DELETE'},
                          create: {method: 'POST'},
                          delete: {method: 'DELETE'}}),
        cloud: $resource(endpoint + 'cloud/:controller', {controller: '@controller'}),
        hypervisors: $resource(endpoint + 'hypervisors/:id', {id: '@id'}),
        vms: $resource(endpoint + 'vms/:id/:controller/:second_id',
            {id: '@id', controller: '@controller', second_id: '@second_id'},
            {put: {method: 'PUT'}}
        ),
        ipranges: $resource(endpoint + 'ipranges/:id',
            {id: '@id'},
            {create: {method: 'POST'}}
        ),
        datasets: $resource(endpoint + 'datasets/:id', {id: '@id'}),
        packages: $resource(endpoint + 'packages/:id',
            {id: '@id'},
            {create: {method: 'POST'}}
        ),
    }

    /* Response with list of strings are not $resource friendly..
       https://groups.google.com/forum/#!msg/angular/QjhN9-UeBVM/UjSgc5CNDqMJ */
    endpoint = endpoint.replace("\\", '');
    ['hypervisors','vms', 'ipranges', 'datasets', 'packages', 'users', 'sessions', 'groups'].forEach(function(resource) {
        services[resource].list = function(cb) {
            return $http.get(endpoint + resource)
                .success(cb)
                .error(cb)
        }
    });

    /* Cache dataset gets! */
    services.datasets.get = function(obj) {
        return $http.get(endpoint + 'datasets/' + obj.id, {cache: true})
    }

    /* VM GET: include the asociated dataset */
    services.vms._get = services.vms.get;
    services.vms.get = function(obj, cb) {

        services.vms._get(obj, function(res) {

            /* Dont get the dataset data when its not a plain get or no dataset found */
            if (obj.controller || !res.config || !res.config.dataset || res.config.dataset === 1) {
                res.uuid = obj['id']
                return cb(res)
            }

            return services.datasets.get({id: res.config.dataset})
                .then(function(dsRes) {
                    if (dsRes)
                        res.config._dataset = dsRes.data
                    cb(res)
                })
        })
    }

    return services

});
