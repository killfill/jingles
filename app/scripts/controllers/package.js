'use strict';

angular.module('fifoApp')
  .controller('PackageCtrl', function ($scope, $routeParams, wiggle, breadcrumbs) {
    
    var uuid = $routeParams.uuid
    wiggle.packages.get({id: uuid}, function(data) {
        $scope.package = data
        breadcrumbs.setLast(data.name)
    })

  });
