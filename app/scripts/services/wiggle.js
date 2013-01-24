'use strict';

fifoApp.factory('wiggle', function($resource, $http) {


    var endpoint = Config.wiggle

    //The port : needs to be escaped to \\:
    if (endpoint.split(':').length>2)
        endpoint = endpoint.replace(/:([^:]*)$/,'\\:'+'$1');

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
        services[resource].list = function(cb, error) {
            return $http.get(endpoint + resource)
                .success(cb)
                .error(function(data) {
                    error && error(data)
                })
        }
    });

    /* Gets with cache! */
    services.datasets.get = function(obj, success, error) {
        return $http.get(endpoint + 'datasets/' + obj.id, {cache: true})
            .success(success)
            .error(function(data) {
                error && error(data)
            })
    }
    services.packages.get = function(obj, success, error) {
        return $http.get(endpoint + 'packages/' + obj.id, {cache: true})
            .success(success)
            .error(function(data) {
                error && error(data)
            })
    }

    /* VM GET: include the asociated data */
    services.vms._get = services.vms.get;
    services.vms.get = function(obj, returnCb) {

        return services.vms._get(obj, function(res) {

            /* No extra call if controller is pressent or no sane vm */
            if (obj.controller || !res.config) {
                res.uuid = obj.id
                return returnCb(res)
            }

            var callsLeft = 2;
            function checkIfReady() {
                callsLeft--;
                if (callsLeft < 1)
                    return returnCb(res)
            }

            if (!res.config.dataset || res.config.dataset === 1)
                checkIfReady();
            else
                services.datasets.get({id: res.config.dataset},
                    function (ds) {
                        res.config._dataset = ds;
                        checkIfReady()
                    },
                    function err(ds) {
                        checkIfReady()
                    }
                )

            if (!res.package)
                checkIfReady();
            else
                services.packages.get({id: res.package},
                    function (p) {
                        res._package = p
                        checkIfReady()
                    },
                    function err() {
                        checkIfReady()
                    }
                )
        })
    }

    return services

});
