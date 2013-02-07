'use strict';

// Add a directive for the bootstrap color picker widget
// http://www.eyecon.ro/bootstrap-colorpicker/
fifoApp.directive('colorpicker', function() {

    return {
        link: function(scope, element, attrs, controller) {

            var m = attrs.ngModel

            return $(element).colorpicker().on('changeColor', function(e) {
                if(!m) return;
                scope.$apply(function () {
                    scope[m] = e.color.toHex();
                })
               
            });

        }
    };
});
