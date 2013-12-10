'use strict';

angular.module('fifoApp')
  .directive('permission', function (auth) {
    return {
      restrict: 'AE',
      scope: {
      	permission: '@' 
      },
      link: function postLink(scope, element, attrs) {

        var origCss = element.css('display')

        //Hide while finish procesing.. 
        element.css('display', 'none')

      	//scope.permission gets evaluated into a string, so parse it..
      	var elementPerm = scope.$eval(attrs.permission)

        function checkPermission() {

          //If user not logged, do nothing..
          if (!auth.currentUser().name) return;

          var hasPermission = auth.canAccess(elementPerm)
          element.css('display', hasPermission? origCss: 'none')
        }

        //Watch for the current user to be available.
        scope.$watch(function() {
        	return auth.currentUser()
        }, checkPermission)

        //Watch for permission change. i.e. when vm.uuid is set as a requirement and the vm becomes available
        attrs.$observe('permission', function(val) {
          elementPerm = scope.$eval(val)
          checkPermission()
        })

      }
    };
  });
