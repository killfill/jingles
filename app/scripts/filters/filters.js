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

/* will return the actual value if it is not empty or the defaultValue */
fifoApp.filter('orDefault', function() {
    return function(value, defaultValue) {
        if (value && value != '') {
            return value;
        }

        return defaultValue;
    };
});

fifoApp.filter('fromNow', function() {
    return function(dateString) {
        if (!dateString) return;
        return moment(new Date(dateString)).fromNow()
    };
});

var addCommas = function(nStr)
{
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

var formatBytes = function(defaultPow1024) {
    return function(bytes, hash) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return;

        hash = hash || {}
        var pow1024 = hash.pow1024 || defaultPow1024 || 0,
            precision = hash.precision || 1,
            units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];

        bytes = bytes * Math.pow(1024, pow1024)
        var number = Math.floor(Math.log(bytes) / Math.log(1024));

        /* Print > MBs in MBs */
        var idx = units.indexOf(number);
        if (number > 2)
            number -= (number - 2);

        var str = ( bytes / Math.pow(1024, Math.floor(number)) ).toFixed(precision);

        str = str.replace(/(.\d*?)0*$/, "$1").replace(/(.*?)\.$/, "$1"); //trim right-zeros
        str = addCommas(str)
        return str +  '' + units[number];
    }
}

fifoApp.filter('bytes', function() {
    return formatBytes()
});

fifoApp.filter('Mbytes', function() {
    return formatBytes(2)
});

fifoApp.filter('Gbytes', function() {
    return formatBytes(3)
});