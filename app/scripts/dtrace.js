//heght of each row in the heatmap
var h = 5;
//width of each column in the heatmap
var w = 20;

var history_size = 30;
var cols = [];

var cur_pos = 0;

var max = 0;

var colorScale;

for (var i = 0; i < history_size; i ++) {
    cols.push([]);
};

var mySVG;
var socket = undefined;

function run(){


    if ('MozWebSocket' in window) {
        WebSocket = MozWebSocket;
    }
    socket = new WebSocket('ws://127.0.0.1/api/0.1.0/dtrace/b620ffaf-870c-4801-ac92-e2b45ce16326/stream');
    /* The only messages we recieve should contain contain the dtrace aggregation data we requested
       on connection. */
    socket.onmessage = function(message){
        var message = JSON.parse(message.data);
        draw(message);
    };
    mySVG = d3
        .select("#content")
        .append("svg")
        .attr("width", (w * 60) + 400)
        .attr("height", (h * 32 + 100))
        .style('position','absolute')
        .style('top',0)
        .style('left',0);

};

function draw(data) {
//    socket.close();
    cols.shift();

    var current = {};
    var col = [];
    var flat = []

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
    cols.push(col);
    var max = 0;
    cols.forEach(function(c) {
//        console.log(c);
        c.forEach(function(app) {
            var total = app[1];//sum(app);
            if (total > max) {
                max = total;
            };
        })
    });
//    console.log(max);
    colorScale = d3.scale.sqrt()
        .domain([0, max])
        .range(["white", "blue"]);

    cols.forEach(function(s, i) {
        flat.push(s.map(function(e) {
            var e0 = e.slice()
            e0.unshift(i)
            return e0;
        }));
    })
    var heatmapRow = mySVG.selectAll(".heatmap")
        .data(flat).enter().append("g");
    // generate heatmap columns
    var heatmapRects = heatmapRow
        .selectAll(".rect")
        .data(function(d) {
            return d;
        }).enter().append("svg:rect")
        .attr('width', w)
        .attr('height', h)
        .attr('x', function(d) {
            return (d[0] * w) + 25;
        })
        .attr('y', function(d) {
            return (h * 32 + 100) - ((d[1]/2 * h) + 50);
        })
        .style('fill',function(d) {
            return colorScale(d[2]);
        })
        .exit()
        .remove();
}


function sum(d) {
    var total = 0;
    d.forEach(function(app) {
        total = total + app[1];
    });
    return total;
}
