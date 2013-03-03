'use strict';

fifoApp.controller('DTraceCtrl', function($scope, $routeParams, $location, wiggle, modal, status) {
    var uuid = $routeParams.uuid;
    var socket = false;

    var renderer;
    var finalize_vars = function(vars) {
        return vars.map(function(v) {
            if (typeof v != "string") {
                return v;
            } else if (v.value.match(/^\d+$/)) {
                v.value = parseInt(v.value);
            } else if (v.value == "true") {
                v.value = true;
            } else if (v.value == "false") {
                v.value = false;
            } else if (v.value == "null") {
                v.value = null;
            };
            return v;
        });
    }

    $scope.hypervisors = {}
    wiggle.hypervisors.list(function(ids){
        ids.forEach(function(id) {
            $scope.hypervisors[id] = {name: id};
            wiggle.hypervisors.get({id: id}, function(e) {
                $scope.hypervisors[id] = e
            });
        })
    });

    $scope.vms = {}
    wiggle.vms.list(function(ids){
        ids.forEach(function(id) {
            $scope.vms[id] = {name: id};
            wiggle.vms.get({id: id}, function(e) {
                $scope.vms[id] = e
            });

        })
    });

    wiggle.dtrace.get({id: uuid}, function(res) {
        res.cur_vars = [];
        res.vars = [];
        for (var n in res.config) {
            res.cur_vars.push({name: n,
                               value: res.config[n]});
            res.vars.push({name: n,
                           value: res.config[n]});
        }

        $scope.script = res;
    });





    $scope.$on('$destroy', function() {
        // we want to close the websocket when we lave the page.
        if (socket) {
            socket.close();
        }
    });
    $scope.sel_hyps = [];
    $scope.sel_vms = [];

    $scope.start = function start() {
        if ($scope.sel_hyps.length == 0 && $scope.sel_vms.length == 0) {
            status.error('You must select at least one hypervisor or one VM!');
            return;
        };

        if ('MozWebSocket' in window) {
            WebSocket = MozWebSocket;
        }

        var wsurl = window.location.protocol.replace(/^http/, "ws")+"//"+window.location.host +'/api/0.1.0/dtrace/' + uuid + '/stream';
        socket = new WebSocket(wsurl);
        /* The only messages we recieve should contain contain the dtrace aggregation data we requested
           on connection. */
        socket.onmessage = function(message){
            var message = JSON.parse(message.data);
            if (message.config) {
                switch (message.config.type) {
                    case "heatmap":
                    default:
                    renderer = new Heatmap("#content", message.config);
                };

            } else {
                if (renderer)
                    renderer.render(message);
            }
        };

        socket.onopen = function() {
            var config = {};
            finalize_vars($scope.script.cur_vars).forEach(function(v){
                if (typeof v.value != "string") {
                } else if (v.value.match(/^\d+$/)) {
                    v.value = parseInt(v.value);
                } else if (v.value == "true") {
                    v.value = true;
                } else if (v.value == "false") {
                    v.value = false;
                } else if (v.value == "null") {
                    v.value = null;
                };
                config[v['name']] = v['value'];
            });
            var data = {config: config,
                        servers: $scope.sel_hyps,
                        vms: $scope.sel_vms};
            socket.send(JSON.stringify(data));
        }
    }
    $scope.stop = function() {
        if (socket) {
            socket.close();
            socket = false;
        }
    }
});
