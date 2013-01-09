'use strict';

fifoApp.factory('wiggle', function($resource, $http) {

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
            $http.get(endpoint + resource)
                .success(cb)
                .error(cb);
        }
    });

    services['vms'].del = function(vm, cb) {
        var r = $http.delete(endpoint + "vms/" + vm.uuid);
        if (cb) {
            r.success(cb)
                .error(cb);
        }
    };

    services['vms'].start = function(vm, cb) {
        console.log("start", vm);
        var r = $http.put(endpoint + "vms/" + vm.uuid, '{"action":"start"}');
        if (cb) {
            r.success(cb)
                .error(cb);
        }
    };

    services['vms'].stop = function(vm, cb) {
        console.log("stop", vm);
        var r = $http.put(endpoint + "vms/" + vm.uuid, '{"action":"stop"}');
        if (cb) {
            r.success(cb)
                .error(cb);
        }
    };

    services['vms'].reboot = function(vm, cb) {
        var r = $http.put(endpoint + "vms/" + vm.uuid, '{"action":"reboot"}');
        if (cb) {
            r.success(cb)
                .error(cb);
        }
    };

    return services

});
