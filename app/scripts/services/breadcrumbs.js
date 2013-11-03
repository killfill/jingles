//Taken from: https://raw.github.com/angular-app/angular-app/master/client/src/common/services/breadcrumbs.js

angular.module('services.breadcrumbs', []);
angular.module('services.breadcrumbs').factory('breadcrumbs', ['$rootScope', '$location', function($rootScope, $location){

  var breadcrumbs = [];
  var breadcrumbsService = {};

  //Maybe this could be moved to a filter, in case we need something similar!
  function humanize(str) {
    var txt = str.split("-").map(function(t) {
        return t.charAt(0).toUpperCase() + t.slice(1);
    })
    return txt.join(' ');
  }

  //we want to update breadcrumbs only when a route is actually changed
  //as $location.path() will get updated imediatelly (even if route change fails!)
  $rootScope.$on('$routeChangeSuccess', function(event, current){

    var pathElements = $location.path().split('/'), result = [], i;
    var breadcrumbPath = function (index) {
      return '/' + (pathElements.slice(0, index + 1)).join('/');
    };

    pathElements.shift();
    for (i=0; i<pathElements.length; i++) {
      if (breadcrumbPath(i) == '/') return breadcrumbs = [];

      //Take the name of the last route element, from the app.js config... :P
      if (i == pathElements.length - 1)
        result.push({name: current.name || humanize(pathElements[i]), path: breadcrumbPath(i)})
      else
        result.push({name: humanize(pathElements[i]), path: breadcrumbPath(i)});
    }

    breadcrumbs = result;
  });

  breadcrumbsService.getAll = function() {
    return breadcrumbs;
  };

  breadcrumbsService.getFirst = function() {
    return breadcrumbs[0] || {};
  };

  return breadcrumbsService;
}]);