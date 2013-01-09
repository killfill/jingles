fifoApp.directive('jqRun', function () {
    return {
        restrict: 'A',
        compile: function () {
            return function (scope, elm, attrs) {

                //FIXME: when clicking on the a, the tooltip keep showing
                if (attrs.jqRun == 'tooltip') {
                    //attrs.placement = 'right'
                    if (elm.children().length>0) {
                        var child = elm.children()[0]
                        $(child).on('click',function() {
                            $(elm).tooltip('hide')
                        })
                    }

                }

                //FIXME: if not inside a timeout, the tooltip gets processed before the templace, so title='{{data}}' will show as {{data}}.. :P
                setTimeout(function() {
                    $(elm)[attrs.jqRun](attrs)
                }, 100);

            };
        }
    };
});