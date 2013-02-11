'use strict';

fifoApp.directive('simplecolorpicker', function() {

    return {
        link: function(scope, element, attrs, controller) {

            var m = attrs.ngModel

            if (!m) return;

            var el = $(element);

            /* Watch for color change */
            scope.$watch(m, function(val, old) {
                
                if (!val || val == old) return;

                el.val(val)
                $('.simplecolorpicker.icon').css('background-color', val);
            })

            return el.simplecolorpicker({
                picker: true
            }).change(function() {

                /* If white, just delete the color.. */
                var val = el.val() == '#ffffff'? false: el.val();

                scope.$apply(function () {
                    scope[m] = val;
                })
            })

        }
    };
});
