fifoApp.directive('jqRun', function () {
    return {
        restrict: 'A',
        compile: function () {
            return function (scope, elm, attrs) {

                if (attrs.jqRun == 'tooltip') {
                    //attrs.placement = 'right'
                    if (elm.children().length>0) {
                        var child = elm.children()[0]
                        $(child).on('click',function() {
                            $(elm).tooltip('hide')
                        })
                    }
                }

                var options = attrs


                //FIXME: if not inside a timeout, the tooltip gets processed before the templace, so title='{{data}}' will show as {{data}}.. :P
                setTimeout(function() {

                    if (attrs.jqOptions)
                        options = scope.$eval(attrs.jqOptions)

                    $(elm)[attrs.jqRun](options)
                }, 500);

            };
        }
    };
});

fifoApp.directive('package', function() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            pkg: '=',
            vmconfig: '=',
            title: '@title'
        },
        template: "<dl class='dl-horizontal'>" +
            "<dt>CPU</dt>" +
            "<dd ng-show='!vmconfig'>Share: {{pkg.ram}}<br/>Cap: {{pkg.cpu_cap}}</dd>" +
            "<dd ng-show='vmconfig.vcpus'>{{vmconfig.vcpus}}</dd>" +
            "<dd ng-hide='!vmconfig || vmconfig.vcpus'>" +
            "{{vmconfig.cpu_shares && 'Share: ' + vmconfig.cpu_shares}}</br>" +
            "{{vmconfig.cpu_cap && 'Cap: ' + vmconfig.cpu_cap}}</dd>" +
            "<dt>Ram</dt>" +
            "<dd class='memory'>{{(pkg.ram || vmconfig.ram) | Mbytes}}</dd>" +
            "<dt>Disk</dt>" +
            "<dd class='memory' ng-hide='vmconfig.disks'>{{(pkg.quota || vmconfig.quota) | Gbytes}}</dd>" +
            "<dd class='memory' ng-repeat='disk in vmconfig.disks'><span title='{{disk.model}} {{disk.bool && \"(booteable)\" || \"\"}}' jq-run='tooltip'>{{disk.size | Mbytes}}</span></dd>" +
            "<dt ng-show='vmconfig.zfs_io_priority'>IO Prio</dt>" +
            "<dd class='memory' ng-show='vmconfig.zfs_io_priority'>{{vmconfig.zfs_io_priority}}</dd>" +
            "</dl>"
    }
})

fifoApp.directive('help', function() {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            link: '@link'
        },
        template:
        '<div class="pull-right">' +
            '  <a target="_new" href="{{link}}"><i class="icon-question-sign"></i></a>' +
            '</div>'
    }
})

fifoApp.directive('columnSelector', function($compile) {
    return {
        restrict: 'E',
        scope: true,
        template: "<div ng-repeat='col in columns'><label class='checkbox'><input type='checkbox' ng-model='col.visible' ng-click='showHideColumn()'> {{col.name}}</div></label>"
    }
})

/**
 * bootstrap directives from datasets.at
 */
fifoApp
    .directive('navTabs', function() {
        return {
            restrict: 'E',
            transclude: true,
            template:
            '<ul class="nav nav-tabs" data-spy="affix" ng-transclude>' +
                '</ul>',
            replace: true
        };
    })
    .directive('navTab', ['$location', function($location) {
        var match = function(href, url) {
            var href_a = href.split('/');
            var url_a = url.split('/');
            var i;

            for (i in href_a) {
                if (href_a[i] !== url_a[i]) {
                    return false;
                }
            }

            return true;
        }

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                'href': '@',
                'icon': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return match(href.substr(1), $location.url());
                };
            },
            template:
            '<li ng-class="{active: location(href)}">' +
                '<a href="{{href}}" class="glyphicons {{icon}}" ng-transclude><i></i></a>' +
                '</li>',
            replace: true
        };
    }]);
