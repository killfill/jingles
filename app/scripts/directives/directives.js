'use strict';

/* TODO: This directive sucks! */
angular.module('fifoApp')
  .directive('jqRun', function () {
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


angular.module('fifoApp')
	.directive('package', function() {
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



angular.module('fifoApp')
    .directive('gauge', function() {
        return {
            restrict: 'E',
            replace: true,
            template: "<canvas class='gauge'></canvas>",
            link: function(scope, el, attrs) {

                // console.log('monitoring', attrs.ngModel, scope.$eval(attrs.ngModel));
                var g = new Gauge(el[0]).setOptions({
                    pointer: {
                        length: 0.8, // The radius of the inner circle
                    },
                    limitMax: true,
                    colorStop: 'blue',    // just experiment with them
                    strokeColor: '#E0E0E0',   // to see which ones work best for you
                    percentColors : [
                        [ 0.0, "#45d70b" ],
                        [ 0.90, "#dede0b" ],
                        [ 1.0, "#ff0000" ]
                    ]
                })

                g.maxValue = 100;
                g.animationSpeed = 10;

                scope.$watch(attrs.ngModel, function(v) {
                    g.set(v * 1 || 0)
                })

                // GC
                // el.on('$destroy', function() {
                //     console.log('ybebye!!!!!')
                // })

            }
        }
    })