'use strict';

angular.module('fifoApp').factory('wiggle', function ($resource, $http, $cacheFactory, $q) {

    var endpoint;
    function setEndpoint(url) {

        var path = '/api/0.1.0/';

        //The port : needs to be escaped to \\:
        if (url.split(':').length>2)
            endpoint = url.replace(/:([^:]*)$/,'\\:'+'$1') + path;
        else
            endpoint = url + path;

        setUpServices();

        //Howl endpoint.
        var tmp = url || (window.location.protocol + '//' + window.location.host);
        Config.howl = Config.howl || tmp.replace(/^http/, "ws") + "/howl";
        Config.endpoint = endpoint;
    }


    var is_empty = function is_empty(obj) {

        // null and undefined are empty
        if (obj == null) return true;
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length && obj.length > 0) return false;
        if (obj.length === 0) return true;

        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    }

    var cacheObj = $cacheFactory('fifoCache');

    var controller_layout = '/:id/:controller/:controller_id/:controller_id1/:controller_id2/:controller_id3';
    function setUpServices() {
        services.sessions = $resource(endpoint + 'sessions/:id',
                                      {id: '@id'},
                                      {get: {method: 'GET', interceptor: {response: userInterceptor}},
                                       login: {method: 'POST', interceptor: {response: userInterceptor}}});
        services.users = $resource(endpoint + 'users' + controller_layout,
                                   {id: '@id',
                                    controller: '@controller',
                                    controller_id: '@controller_id',
                                    controller_id1: '@controller_id1',
                                    controller_id2: '@controller_id2',
                                    controller_id3: '@controller_id3'},
                                   {put: {method: 'PUT'},
                                    grant: {method: 'PUT'},
                                    getFull: {
                                        method: 'GET', cache: true,
                                        interceptor: {
                                            response: function(res) {

                                                var user = res.resource

                                                //Additional calls
                                                var groupCalls = user.groups.map(function(id) {
                                                    return services.groups.get({id: id}).$promise;
                                                });

                                                var orgCalls = user.orgs.map(function(id) {
                                                    return services.orgs.get({id: id}).$promise;
                                                });

                                                //Responses
                                                var groups = $q.all(groupCalls).then(function(res) {
                                                    //Put it in a hash, its more handy for using it later.
                                                    user._groups = {};
                                                    res.forEach(function(r) {user._groups[r.uuid] = r});
                                                    return user;
                                                });

                                                var orgs = $q.all(orgCalls).then(function(res) {
                                                    //Put it in a hash, its more handy for using it later.
                                                    user._orgs = {};
                                                    res.forEach(function(r) {user._orgs[r.uuid] = r});
                                                    return user;
                                                });

                                                //Return a promise with user as the result.
                                                return $q.all([groups, orgs]).then(function() {
                                                    return user;
                                                });
                                            }
                                        }
                                    },
                                    revoke: {method: 'DELETE'},
                                    create: {method: 'POST'},
                                    delete: {method: 'DELETE'}});
        services.groups = $resource(endpoint + 'groups' + controller_layout,
                                    {id: '@id',
                                     controller: '@controller',
                                     controller_id: '@controller_id',
                                     controller_id1: '@controller_id1',
                                     controller_id2: '@controller_id2',
                                     controller_id3: '@controller_id3'},
                                    {put: {method: 'PUT'},
                                     get: {method: 'GET', cache: true},
                                     grant: {method: 'PUT'},
                                     revoke: {method: 'DELETE'},
                                     create: {method: 'POST'},
                                     delete: {method: 'DELETE'},
                                     query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.orgs = $resource(endpoint + 'orgs' + controller_layout,
                                  {id: '@id',
                                   controller: '@controller',
                                   controller_id: '@controller_id',
                                   controller_id1: '@controller_id1',
                                   controller_id2: '@controller_id2',
                                   controller_id3: '@controller_id3'},
                                  {put: {method: 'PUT'},
                                   get: {method: 'GET', cache: true},
                                   grant: {method: 'PUT'},
                                   revoke: {method: 'DELETE'},
                                   create: {method: 'POST'},
                                   delete: {method: 'DELETE'},
                                   query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.cloud = $resource(endpoint + 'cloud/:controller', {controller: '@controller'});
        services.hypervisors = $resource(endpoint + 'hypervisors/:id/:controller/:controller_id',
                                         {id: '@id', controller: '@controller', controller_id: '@controller_id'},
                                         {put: {method: 'PUT'},
                                          delete: {method: 'DELETE'},
                                          query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.vms = $resource(endpoint + 'vms/:id/:controller/:controller_id',
                                 {id: '@id', controller: '@controller', controller_id: '@controller_id'},
                                 {put: {method: 'PUT'},
                                  query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.ipranges = $resource(endpoint + 'ipranges/:id',
                                      {id: '@id'},
                                      {create: {method: 'POST'},
                                       get: {method: 'GET', cache: true},
                                       delete: {method: 'DELETE'},
                                       query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.networks = $resource(endpoint + 'networks' + controller_layout,
                                      {id: '@id',
                                       controller: '@controller',
                                       controller_id: '@controller_id',
                                       controller_id1: '@controller_id1',
                                       controller_id2: '@controller_id2'},
                                      {put: {method: 'PUT'},
                                       create: {method: 'POST'},
                                       get: {method: 'GET', cache: true},
                                       delete: {method: 'DELETE'},
                                       query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.datasets = $resource(endpoint + 'datasets/:id',
                                      {id: '@id'},
                                      {import: {method: 'POST'},
                                       put: {method: 'PUT'},
                                       query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.packages = $resource(endpoint + 'packages/:id',
                                      {id: '@id'},
                                      {create: {method: 'POST'},
                                       get: {method: 'GET', cache: true},
                                       delete: {method: 'DELETE'},
                                       query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});
        services.dtrace = $resource(endpoint + 'dtrace/:id',
                                    {id: '@id'},
                                    {create: {method: 'POST'},
                                     delete: {method: 'DELETE'},
                                     query: {method: 'GET', isArray: true, headers: {'x-full-list': true}}});


        /* Response with list of strings are not $resource friendly..
           https://groups.google.com/forum/#!msg/angular/QjhN9-UeBVM/UjSgc5CNDqMJ */
        endpoint = endpoint.replace("\\", '');
        ['hypervisors', 'orgs', 'vms', 'networks', 'ipranges', 'datasets', 'packages', 'users', 'sessions', 'groups', 'dtrace'].forEach(function(resource) {
            services[resource].list = function(cb, error) {
                return $http.get(endpoint + resource)
                    .success(cb)
                    .error(function(data) {
                        error && error(data);
                    })
            };

            /* Resources that has put may save metadata, i.e. PUT vms/metadata/jingles {locked: true} */
            if (services[resource].put) {
                services[resource].prototype.mdata_set = function(obj, cb) {
                    var id = this.uuid,
                    that = this;
                    if (is_empty(obj))
                        return;
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

        services.datasets.clearCache = function(id) {
            cacheObj.remove(endpoint + 'datasets/' + id)
        }
        services.datasets.get = function(obj, success, error) {
            return $http.get(endpoint + 'datasets/' + obj.id, {cache: cacheObj})
                .success(function(res) {
                    //If the dataset is not 100% ready, do not cache it.
                    success(res)
                    if (res.imported === 1)
                        return;
                    services.datasets.clearCache(obj.id)
                })
                .error(function(data) {
                    error && error(data)
                })
        }

        /* VM GET: include the asociated data. TODO: Use promises in here.. */
        services.vms._get = services.vms.get;
        services.vms.get = function(obj, returnCb, errorCb) {

            return services.vms._get(obj, function(res) {

                /* No extra call if controller is pressent or no sane vm */
                if (obj.controller || !res.config) {
                    res.uuid = obj.id
                    return returnCb(res)
                }

                var callsLeft = 4;
                function checkIfReady() {
                    callsLeft--;
                    if (callsLeft < 1)
                        return returnCb(res)
                }

                // if (angular.isUndefined(res.config.dataset) || res.config.dataset === 1) {
                if (angular.isUndefined(res.config.dataset)) {
                    checkIfReady();
                } else {
                    services.datasets.get(
                        {id: res.config.dataset},
                        function (ds) {
                            res.config._dataset = ds;
                            checkIfReady();
                        },
                        function err(ds) {
                            checkIfReady();
                        }
                    )
                };

                if (angular.isUndefined(res.package)) {
                    checkIfReady();
                } else {
                    services.packages.get(
                        {id: res.package},
                        function (p) {
                            res._package = p;
                            checkIfReady();
                        },
                        function err() {
                            checkIfReady();
                        }
                    )
                }

                if (angular.isUndefined(res.owner)) {
                    checkIfReady();
                } else {
                    services.orgs.get({id: res.owner},
                                      function(org) { res._owner = org; checkIfReady(); },
                                      function err() {checkIfReady();})
                }

                if (angular.isUndefined(res.hypervisor)) {
                    checkIfReady();
                } else {
                    services.hypervisors.get({id: res.hypervisor},
                                             function(data) { res._hypervisor = data; checkIfReady(); },
                                             function err() {checkIfReady();})
                }
            }, errorCb);
        }
    }

    //About interceptor's:
    //Using interceptor to *full* the object with aditional data comming from a different request.
    //When you return a promise (to wait until the additional request finishes), the $resource callback
    //will return that promise instead of the original $resource. Ref: https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js#L501
    //To make this explicit, and to make it not a surprise for dev's, will define getFull instead of overriding the default 'get'

    //Add _group object to the user...
    var userInterceptor = function(res) {

        var user = res.resource;
        user._groups = {};
        // return user;
        if (!user.groups) return user;

        var groupCalls = user.groups.map(function(id) {
            return services.groups.get({id: id}).$promise;
        })

        return $q.all(groupCalls).then(function(res) {
            res.forEach(function(r) {user._groups[r.uuid] = r});
            return user;
        })
    }

    var services = {}
    if (Config.backends && Config.backends[0] && Config.backends[0].endpoint) {
        setEndpoint(Config.backends[0].endpoint);
    } else {
        setEndpoint(''); //start pointing to current backend
    }'
    services.setEndpoint = setEndpoint;

    return services;
});
