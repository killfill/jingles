
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
            return [i - _size, v];
        });
    };
}



function MetricsGraph(id, opts) {
    var _unit = opts.unit || "";
    var _series = opts.series || [];
    var _graph;
    var _container = document.getElementById(id);
    var _metrics = _series.map(function(s) {
        s.size = opts.size;
        return new MetricSeries(s);
    });

    var _colors = ["red", "blue", "green"]
    var redraw = function() {
        if (!$(_container).is(":visible"))
            return;
        var datapoints = _metrics.map(function(m) {
            return m.data_points();
        });
        if (opts.type == "percentage") {
            for (var i = 0; i < opts.size; i++) {
                var total = 0;
                datapoints.forEach(function(d) {
                    total = total + d[i][1];
                });

                if (total > 0) {
                    datapoints = datapoints.map(function(d) {
                        d[i][1] = 100*(d[i][1]/total);
                        return d;
                    })
                }

            };
        }
        datapoints = datapoints.map(function(d, i) {
            var data = {};
            if (_series[i].options) {
                data = _series[i].options;
            }
            data.data = d;
            return data;
        });
        var _config = {HtmlText : false,
                       yaxis:{titleAngle: 90},
                       legend : {
                           position : 'nw'
                       }};
        if (opts.unit)
            _config.yaxis.title = opts.unit;
        if (opts.min)
            _config.yaxis.min = opts.min;
        if (opts.max)
            _config.yaxis.max = opts.max;

        _graph = Flotr.draw(_container, datapoints, _config)
    }

    this.add = function (es) {
        es.forEach(function(e, i) {
            _metrics[i].add(e);
        });
        redraw();
    };
};