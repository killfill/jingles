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

function preventHrefTab() {
    //No idea why doesnt .preventDefault work on the functoin that has bootstrap.js.
    //Had to put it in here, to prevent the anchor to follow its href, on tabs and collapse's
    //Worked without this on jingles v1
    function prevent(e) {e.preventDefault()}
    $('[data-toggle=tab]').on('click', prevent);
    $('[data-toggle=collapse]').on('click', prevent);
}
