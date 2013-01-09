'use strict';

fifoApp.controller('DatasetsCtrl', function($scope, wiggle, status) {

    $scope.datasets = {}

    $scope.show = function() {

        wiggle.datasets.list(function (ids) {

            ids.length > 0 && status.update('Loading datasets', {total: ids.length})

            ids.forEach(function(id) {

                $scope.datasets[id] = {dataset: id}
                wiggle.datasets.get({id: id}, function(res) {
                    $scope.datasets[id] = addFields(res)
                    status.update('Loading datasets', {add: 1})
                })

            })
        })
    }

    $scope.show()

    var addFields = function(ds) {
        ds._nets = (ds.networks || []).map(function(e) { return e.name + ': ' + e.description}).join(", ");
        return ds;
    }
});
