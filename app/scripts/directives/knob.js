'use strict';

fifoApp.directive('knob', function() {

    return {
        link: function(scope, element, attrs, controller) {

            return $(element).knob({
                'change': function(val) {

                    var m = attrs.ngModel
                    if (!m) return;
                    scope.$apply(function () {
                        scope[m] = val;
                    })
                }
            })

        }
    };
});
