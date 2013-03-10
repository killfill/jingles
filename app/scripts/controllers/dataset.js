'use strict';

fifoApp.controller('DatasetCtrl', function($scope, $routeParams, wiggle) {
    $scope.setTitle('Dataset details')

    var uuid = $routeParams.uuid
    wiggle.datasets.get({id: uuid}, function(data) {
        $scope.dataset = data
    })
})
