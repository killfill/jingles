'use strict';

fifoApp.factory('wiggle', function($resource, $http) {


    var endpoint = Config.wiggle

    //The port : needs to be escaped to \\:
    if (endpoint.split(':').length>2)
        endpoint = endpoint.replace(/:([^:]*)$/,'\\:'+'$1');

    var services = {
        sessions: $resource(endpoint + 'sessions/:id',
                            {id: '@id'},
                            {login: {method: 'POST'}}
                           ),
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
        hypervisors: $resource(endpoint + 'hypervisors/:id/:controller/:controller_id',
                               {id: '@id', controller: '@controller', controller_id: '@controller_id'},
                               {put: {method: 'PUT'},
                                delete: {method: 'DELETE'}}
                              ),
        vms: $resource(endpoint + 'vms/:id/:controller/:controller_id',
                       {id: '@id', controller: '@controller', controller_id: '@controller_id'},
                       {put: {method: 'PUT'}}
                      ),
        ipranges: $resource(endpoint + 'ipranges/:id',
                            {id: '@id'},
                            {create: {method: 'POST'}}
                           ),
        datasets: $resource(endpoint + 'datasets/:id', {id: '@id'}),
        packages: $resource(endpoint + 'packages/:id',
                            {id: '@id'},
                            {create: {method: 'POST'},
                             delete: {method: 'DELETE'}}
                           ),
        dtrace: $resource(endpoint + 'dtrace/:id',
                          {id: '@id'},
                          {create: {method: 'POST'},
                           delete: {method: 'DELETE'}}
                         ),

    }

    /* Response with list of strings are not $resource friendly..
       https://groups.google.com/forum/#!msg/angular/QjhN9-UeBVM/UjSgc5CNDqMJ */
    endpoint = endpoint.replace("\\", '');
    ['hypervisors','vms', 'ipranges', 'datasets', 'packages', 'users', 'sessions', 'groups', 'dtrace'].forEach(function(resource) {
        services[resource].list = function(cb, error) {
            return $http.get(endpoint + resource)
                .success(cb)
                .error(function(data) {
                    error && error(data)
                })
        }

        /* Resources that has put may save metadata, i.e. PUT vms/metadata/jingles {locked: true} */
        if (services[resource].put) {
            services[resource].prototype.mdata_set = function(obj, cb) {
                var id = this.uuid,
                that = this;

                return services[resource].put({id: id, controller: 'metadata', controller_id: 'jingles'}, obj, function() {
                    Object.keys(obj).forEach(function(k) {
                        if (!that.metadata) that.metadata = {}
                        if (!that.metadata.jingles) that.metadata.jingles = {}
                        that.metadata.jingles[k] = obj[k]
                        cb && cb(obj)
                    })
                })
            }
        }
        /* Metadata get helper */
        services[resource].prototype.mdata = function(key) {
            var m = this.metadata
            return m && m.jingles && m.jingles[key]
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
