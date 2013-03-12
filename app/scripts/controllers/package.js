'use strict';

fifoApp.controller('PackageCtrl', function($scope, $routeParams, wiggle) {
    $scope.setTitle('Package details')

    var uuid = $routeParams.uuid
    wiggle.packages.get({id: uuid}, function(data) {
        $scope.package = data
    })
})
