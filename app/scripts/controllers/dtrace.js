'use strict';

fifoApp.controller('DTraceCtrl', function($scope, $routeParams, $location, wiggle, modal, status) {
    var uuid = $routeParams.uuid;
    var socket = false;

    //heght of each row in the heatmap
    var h = 5;
    //width of each column in the heatmap
    var w = 15;

    var history_size = 20;

    var cols = [];

    var bucket_count = 32;
    var bucket_size = 2;

    for (var i = 0; i < history_size; i ++) {
        cols.push([]);
    };

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

    wiggle.dtrace.get({id: uuid}, function(res) {
        console.log(res);
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

    var sum = function sum(d) {
        var total = 0;
        d.forEach(function(app) {
            total = total + app[1];
        });
        return total;
    }


    var render = function render(data) {
        //    socket.close();

        var current = {};
        var col = [];
        var flat = []
        var max = 0;

        for (var element in data) {
            for (var bucket in data[element]) {
                var val = data[element][bucket];
                var b = bucket.split("-")[0];
                if (! current[b]) {
                    current[b] = [[element, val]];
                } else {
                    current[b].push([element, val]);
                };
            }
        }

        for (bucket in current) {
            col.push([parseInt(bucket), sum(current[bucket]), current[bucket]])
        };

        col.forEach(function(app) {
            var total = app[1];//sum(app);
            if (total > max) {
                max = total;
            };
        })

        flat = col.map(function(e, i) {
            var e0 = e.slice()
            e0.unshift(i)
            return e0;
        });

        if (! flat.length)
            return;

        var colorScale = d3.scale.sqrt()
            .domain([0, max])
            .range(["white", "blue"]);

        var first = cols.shift();
        if (first["svg"])
            first.svg.remove();

        var mySVG = d3
            .select("#content")
            .append("svg")
            .attr("width", w)
            .attr("height", (h * bucket_count + 100))

        // generate heatmap columns
        var heatmapRects = mySVG
            .selectAll(".rect")
            .data(flat)
            .enter().append("svg:rect")
            .attr('width', w)
            .attr('height', h)
            .attr('x', function(d) {
                return 0;
            })
            .attr('y', function(d) {
                return (h * bucket_count + 100) - ((d[1]/bucket_size * h) + 50);
            })
            .style('fill',function(d) {
                return colorScale(d[2]);
            });

        cols.push({svg: mySVG, data: flat});
    }


    $scope.$on('$destroy', function() {
        // we want to close the websocket when we lave the page.
        if (socket) {
            socket.close();
        }
    });

    $scope.start = function start() {
        if ('MozWebSocket' in window) {
            WebSocket = MozWebSocket;
        }
        socket = new WebSocket('ws://127.0.0.1/api/0.1.0/dtrace/' + uuid + '/stream');
        /* The only messages we recieve should contain contain the dtrace aggregation data we requested
           on connection. */
        socket.onmessage = function(message){
            var message = JSON.parse(message.data);
            if (message.config) {
                console.log(message.config);
                bucket_count =  ((message.config.end - message.config.start + 1)/message.config.step) || 32;
                bucket_size =  message.config.step || 2;
            } else {
                render(message);
            }
        };

        socket.onopen = function() {
            var config = {};
            finalize_vars($scope.script.cur_vars).forEach(function(v){
                if (v['name'] && v['value'])
                    config[v['name']] = v['value'];
            });
            socket.send(JSON.stringify(config));
        }
    }
    $scope.stop = function() {
        if (socket) {
            socket.close();
            socket = false;
        }
    }
});
