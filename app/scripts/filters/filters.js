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
		return moment(new Date(dateString)).fromNow()
	};
});