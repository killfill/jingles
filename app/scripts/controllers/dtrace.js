'use strict';

fifoApp.controller('DTraceCtrl', function($scope, $routeParams, $location, wiggle, modal, status) {
    var uuid = $routeParams.uuid;
    var socket = false;

    var renderer;
    $scope.running = false;

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
//        $scope.running = true;

        // if we already created a renderer we just need to enable it again.
        if (renderer) {
            $scope.running = true;
            renderer.play();
            return
        }

        if ($scope.sel_hyps.length == 0 && $scope.sel_vms.length == 0) {
            status.error('You must select at least one hypervisor or one VM!');
            return;
        };

        if ('MozWebSocket' in window) {
            WebSocket = MozWebSocket;
        }

        var wsurl = window.location.protocol.replace(/^http/, "ws")+"//"+window.location.host +'/api/0.1.0/dtrace/' + uuid + '/stream';
        console.log("msgpack!")
        socket = new WebSocket(wsurl, 'msgpack');
        socket.binaryType = "arraybuffer";

        /* The only messages we recieve should contain contain the dtrace aggregation data we requested
           on connection. */
        socket.onmessage = function(message){
            var message = msgpack.unpack(new Uint8Array(message.data));
            if (message.config) {
                switch (message.config.type) {
                case "heatmap":
                default:
                    $scope.$apply(function() {$scope.running = true});
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
            var bin = new Uint8Array(msgpack.pack(data));
            socket.send(bin.buffer);
        }
    }

    $scope.pause = function() {
        if (renderer) {
            $scope.running = false;
            renderer.stop();
        }
    }
    $scope.stop = function() {
        if (socket) {
            $scope.running = false;
            renderer = undefined;
            socket.close();
            socket = false;
        }
    }
});
