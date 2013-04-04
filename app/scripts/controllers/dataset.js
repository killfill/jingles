'use strict';

fifoApp.controller('DatasetCtrl', function($scope, $routeParams, wiggle, status) {
    $scope.setTitle('Dataset details')

    var uuid = $routeParams.uuid
    wiggle.datasets.get({id: uuid}, function(data) {
        $scope.dataset = data
        $scope.networks = data.networks
    })

    $scope.save = function(nets) {
        wiggle.datasets.put({id: uuid},
                            {networks: nets},
                            function success(res) {
                                status.success('Dataset changed')
                                wiggle.datasets.clearCache(uuid)
                            })
    }
})
