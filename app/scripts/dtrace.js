//heght of each row in the heatmap
var h = 5;
//width of each column in the heatmap
var w = 20;

var history_size = 30;

var cols = [];

var max = 0;

var colorScale;

var bucket_count = 32;
var bucket_size = 2;

var mySVG;

var socket = undefined;

for (var i = 0; i < history_size; i ++) {
    cols.push([]);
};

function run(){

    if ('MozWebSocket' in window) {
        WebSocket = MozWebSocket;
    }
    socket = new WebSocket('ws://127.0.0.1/api/0.1.0/dtrace/b620ffaf-870c-4801-ac92-e2b45ce16326/stream');
    /* The only messages we recieve should contain contain the dtrace aggregation data we requested
       on connection. */
    socket.onmessage = function(message){
        var message = JSON.parse(message.data);
        if (message.config) {
            bucket_count =  ((message.config.end - message.config.start + 1)/message.config.step) || 32;
            bucket_size =  message.config.step || 2;
        } else {
            draw(message);
        }
    };

    socket.onopen = function() {
        socket.send('');
    }


};

function draw(data) {
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

    flat = col.map(function(e) {
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
    if (first.svg)
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


function sum(d) {
    var total = 0;
    d.forEach(function(app) {
        total = total + app[1];
    });
    return total;
}
