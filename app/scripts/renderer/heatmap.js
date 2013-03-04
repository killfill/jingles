var x = [];
function Heatmap(target, config) {
    console.log("New heatmap renderer:", config);
    this.target = target;
    this.config = config;
    //heght of each row in the heatmap
    this.h = 10;
    //width of each column in the heatmap
    this.w = 20;
    this.cols = [];

    //number of seconds to show.
    this.history_size = 20;
    if (config.history_size != undefined)
        this.history_size = config.history_size;

    //number of buckets
    this.bucket_count = 32
    if (config.end != undefined && config.start != undefined && config.step != undefined)
        this.bucket_count =  ((config.end - config.start + 1)/config.step);

    //size of buckets
    this.bucket_size = 2;
    if (config.step != undefined)
        this.bucket_size =  config.step || 2;

    for (var i = 0; i < this.history_size; i ++) {
        this.cols.push([]);
    };
    d3.select(this.target)
        .attr("style", "background: white;")

    this.play = true;
}

Heatmap.prototype.start = function() {
    this.play = true;
}

Heatmap.prototype.stop = function() {
    this.play = false;
}

Heatmap.prototype.render = function render(data) {
    if (!this.play)
        return;

    /*
     * Thank you javascript, we can't use this in function callbacks it seems -.-
     * so we have to pull in the relevent data ...
     * I mean it's not like callbacks are used often in this language, it's a corner
     * case really.
     * Seriousely who would expect that this is bound in the place where the function
     * is created instead of the place where the function is called, that nearly would
     * make sense.
     * It's not like anyone would want functions to have a predictalbe behaviour when they
     * can have the fun of hoping that they behave differntly depending on where they are
     * called from.
     */

    var h = this.h;
    var w = this.w;
    var bucket_count = this.bucket_count;
    var bucket_size = this.bucket_size;

    // collector for the data
    var current = {};
    var col = [];
    var flat = []
    var max = 0;

    // Sup up the single instances to a total
    var sum = function sum(d) {
        var total = 0;
        d.forEach(function(app) {
            total = total + app[1];
        });
        return total;
    }

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

    var first = this.cols.shift();

    if (first["svg"])
        first.svg.remove();

    var mySVG = d3
        .select(this.target)
        .append("svg")
        .attr("width", w)
        .attr("height", (h * bucket_count + 100))

    // generate heatmap columns
    var heatmapRects = mySVG
        .selectAll(".rect")
        .data(flat)
        .enter()
        .append("svg:rect")
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

    $(heatmapRects[0]).tooltip({
        html: true,
        title: function(e) {
        var start = this.__data__[1];
        var cnt = this.__data__[2];
        var details = this.__data__[3];
        details = details.reduce(function (acc, e) {
            return acc + "<br/><b>" + e[0] + "</b>: " + e[1];
        }, "");
        return "Bucket[" + start + "]: <b>" + cnt + "</b>" + details;
    }});

    this.cols.push({svg: mySVG, data: flat});
};
