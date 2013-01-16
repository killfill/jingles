'use strict';

/* Call filterFilter with the values of the hash */
fifoApp.filter('hash2array', function() {

    return function(objs) {
        var values = []
        for (var k in objs)
            if (objs.hasOwnProperty(k))
                values.push(objs[k])
            return values
        }

    })

fifoApp.filter('fromNow', function() {
    return function(dateString) {
        if (!dateString) return;
        return moment(new Date(dateString)).fromNow()
    };
});

fifoApp.filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return;
        if (typeof precision === 'undefined') precision = 0;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes/Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
});