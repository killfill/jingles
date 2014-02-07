'use strict';

angular.module('fifoApp')
  .controller('DatasetCtrl', function ($scope, $routeParams, wiggle, status, breadcrumbs) {

    var uuid = $routeParams.uuid
    wiggle.datasets.get({id: uuid}, function(data) {
        $scope.dataset = data
        $scope.networks = data.networks
        breadcrumbs.setLast(data.name + ' ' + data.version)
    })

    $scope.save = function(nets) {
        wiggle.datasets.put({id: uuid},
                            {networks: nets},
                            function success(res) {
                                status.success('Dataset changed')
                                wiggle.datasets.clearCache(uuid)
                            },
                            function error(er) {
                                status.error('Could not change dataset')
                            })
    }
  });
