'use strict';

fifoApp.controller('PackageCtrl', function($scope, $routeParams, wiggle) {
    var uuid = $routeParams.uuid
    wiggle.packages.get({id: uuid}, function(data) {
        $scope.package = data
    })
})
