'use strict';

fifoApp.factory('howl', function($rootScope, $compile) {

    howl._wsMessage = function(e) {
        var msg = howl.decode(e.data),
        type = msg.message && msg.message.event || 'main';
        $rootScope.$broadcast(type, msg)
        if (Config.mode == 'dev' && !msg.pong)
            console.debug('[howl] receive:', msg, type)
    }

    /* Put the connection info on the rootScope, so use can see it... */
    setInterval(function () {
        if ($rootScope.howlConnected === howl._connected) return;
        $rootScope.howlConnected = howl._connected;
        $rootScope.$digest();
    }, 1000);

    return {
        connect: howl.connect,
        join: howl.join,
        send: howl.send,
        disconnect: howl.disconnect
    }

});

var howl = {
    _connected: false,
    _token: false,
    _join_channels_on_connect: [],
    decode: function(e) {
        var r = msgpack.unpack(new Uint8Array(e));
        return r;
    },
    encode: function(d) {
        return (new Uint8Array(msgpack.pack(d))).buffer;
    },
    _wsOpen: function(e) {
        howl.send({token: howl._token});
        Config.mode == 'dev' && console.log('[howl] connection open')
        howl._connected = true

        //Join the pending channels..
        howl.join(howl._join_channels_on_connect)

        setInterval(function() {
            howl._connected == true && howl._token && howl.send({ping: 1})
        }, 1000);

    },

    _wsClose: function(e) {
        howl._connected = false
        if (!howl._token)
            return;
        console.log('[howl] connection closed, reconnecting in 5[s]...')
        setTimeout(howl.connect, 5000)
    },

    disconnect: function() {
        if (howl.ws) {
            howl.ws.close();
            howl.ws = null;
        }
        howl._connected = false;
        howl._token = null;
    },

    connect: function(token) {

        if (howl.ws)
            howl.disconnect();

        if (token)
            howl._token = token

        howl.ws = new WebSocket(Config.howl, 'msgpack')
        howl.ws.binaryType = "arraybuffer";
        howl.ws.onopen = howl._wsOpen
        howl.ws.onclose = howl._wsClose
        howl.ws.onmessage = howl._wsMessage
    },

    send: function(data) {
        if (Config.mode=='dev' && !data.ping)
            console.debug('[howl] send:   ', data)
        howl.ws.send(howl.encode(data))
    },

    join: function(channel) {
        if (typeof channel.forEach == 'function')
            return channel.forEach(howl.join)

        if (!howl._connected)
            return howl._join_channels_on_connect.push(channel)

        howl.send({join: channel})
    },
    leave: function(channel) {
        if (typeof channel.forEach == 'function')
            return channel.forEach(howl.leave)

        howl.send({leave: channel})
    }


}

function MetricSeries(opts) {
    var _scale = opts.scale || 1;
    var _size = opts.size || 30;
    var _type = opts.type || "progressive";
    var _raw = [];
    var values = [];
    var _last;
    for (var i = 0; i < _size; i ++) {
        _raw[i] = 0;
        values[i] = 0;
    }

    this.add = function(v) {
        _raw.shift();
        _raw.push(v);
        switch (_type) {
        case "progressive":
            if (_last) {
                values.shift();
                values.push((v - _last)/_scale);
            }
            break;
        case "absolute":
            values.shift();
            values.push(v/_scale);
        }
        _last = v;
    };

    this.data_points = function() {
        return values.map(function(v, i) {
            return {x: i, y: v};
        });
    };
}


function MetricsGraph(id, opts) {
    var _unit = opts.unit || "";
    var _series = opts.series || [];

    var _chart;

    var _metrics = _series.map(function(s) {
        s.size = opts.size;
        return new MetricSeries(s);
    });

    var _colors = ["red", "blue", "green"]
    var redraw = function() {
        var datapoints = _metrics.map(function(m) {
            return m.data_points();
        });
        if (opts.type == "percentage") {
            for (var i = 0; i < opts.size; i++) {
                var total = 0;
                datapoints.forEach(function(d) {
                    total = total + d[i].y;
                });

                if (total > 0) {
                    datapoints = datapoints.map(function(d) {
                        d[i].y = 100*(d[i].y/total);
                        return d;
                    })
                }

            };
        }

        var data = _series.map(function(s, i) {
            return {
                "key": s.key || "unnamed",
                "color": s.color || _colors[i],
                "values": datapoints[i]
            }
        });

        d3.select(id +' svg')
            .datum(data)
            .call(_chart);
    }

    nv.addGraph(function () {
        _chart = nv.models.lineChart();
        _chart.lines
            .interactive(false)
            .scatter.size(0);
        _chart
            .tooltips(false)
            .interactive(false);
        _chart.xAxis
            .axisLabel('Time')
            .tickFormat(d3.format(',r'));
        _chart.yAxis
            .axisLabel(_unit)
            .tickFormat(d3.format('.0f'));
        nv.utils.windowResize(redraw);
        return _chart;
    });

    this.add = function (es) {
        es.forEach(function(e, i) {
            _metrics[i].add(e);
        });
        redraw();
    };
};
