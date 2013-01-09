'use strict';

fifoApp.factory('wiggle', function($resource, $http) {

    var mk_callback = function(r, cb) {
        if (cb) {
            if (typeof cb == 'function') {
                cb = {
                    success: cb,
                    error: cb
                };
            }
            if (cb.success)
                r.success(cb.success)
            if (cb.error)
                r.error(cb.error)
        }
        r
    }
    var endpoint = Config.wiggle

    var services = {
        users: $resource(endpoint + 'users/:login/:controller/:id',
            {login: '@login'},
            {login: {method: 'PUT', params: {controller: 'sessions'}}}
            ),
        cloud: $resource(endpoint + 'cloud'),
        hypervisors: $resource(endpoint + 'hypervisors/:id', {id: '@id'}),
        vms: $resource(endpoint + 'vms/:id',
            {id: '@id'},
            {put: {method: 'PUT'}}
            ),
        ipranges: $resource(endpoint + 'ipranges/:id', {id: '@id'}),
        datasets: $resource(endpoint + 'datasets/:id', {id: '@id'}),
        packages: $resource(endpoint + 'packages/:id', {id: '@id'}),
    }

    /* Response with list of strings are not $resource friendly..
    https://groups.google.com/forum/#!msg/angular/QjhN9-UeBVM/UjSgc5CNDqMJ */
    endpoint = endpoint.replace("\\", '');
    ['hypervisors','vms', 'ipranges', 'datasets', 'packages', 'users'].forEach(function(resource) {
        services[resource].list = function(cb) {
            mk_callback($http.get(endpoint + resource), cb)
        }
    });

    services['vms'].del = function(vm, cb) {
        mk_callback($http.delete(endpoint + "vms/" + vm.uuid), cb);
    };

    services['vms'].start = function(vm, cb) {
        mk_callback($http.put(endpoint + "vms/" + vm.uuid, '{"action":"start"}'), cb);
    };

    services['vms'].stop = function(vm, cb) {
        mk_callback($http.put(endpoint + "vms/" + vm.uuid, '{"action":"stop"}'), cb);
    };

    services['vms'].reboot = function(vm, cb) {
        mk_callback($http.put(endpoint + "vms/" + vm.uuid, '{"action":"reboot"}'), cb);
    };

    return services

});
