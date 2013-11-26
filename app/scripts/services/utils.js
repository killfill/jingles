'use strict';

angular.module('fifoApp')
  .factory('utils', function () {
    
    return {

        //Deserialize a string, and convert it to an array, number or just return a string.
        deserialize: function(value) {
            var ret = value;

            /* If it has commas, its an array of string */
            if (value.indexOf(',')>-1)
                ret = value.split(',')

            /* See if its a number */
            if ( (value - 0) == value && value.length > 0)
                ret = parseFloat(value, 10)

            return ret
        }
    }
  });
