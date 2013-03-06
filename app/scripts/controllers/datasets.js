'use strict';

fifoApp.controller('DatasetsCtrl', function($scope, wiggle, status) {

    $scope.datasets = {}

    $scope.import = function() {
        wiggle.datasets.import({},
                               {url: $scope.url},
                               function(r) {
                                   console.log(r);
                               });
    };

    $scope.show = function() {

        wiggle.datasets.list(function (ids) {

            ids.length > 0 && status.update('Loading datasets', {total: ids.length})

            ids.forEach(function(id) {

                wiggle.datasets.get({id: id},
                    function success(res) {
                        if (res) $scope.datasets[id] = addFields(res)
                        status.update('Loading datasets', {add: 1})
                    },
                    function error (res) {
                        //Maybe we should not even show the dataset?
                        $scope.datasets[id] = {dataset: id}
                        status.update('Loading datasets', {add: 1})
                    }
                )

            })
        })
    }

    $scope.show()

    var addFields = function(ds) {
        ds._nets = (ds.networks || []).map(function(e) { return e.name + ': ' + e.description}).join(", ");
        return ds;
    }
});
