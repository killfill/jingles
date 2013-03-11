'use strict';

fifoApp.controller('DatasetsCtrl', function($scope, wiggle, status, datasetsat, howl, modal) {
    $scope.setTitle('Datasets')

    $scope.datasets = {}
    $scope.endpoint = Config.datasets

    $scope.import = function(dataset) {
        var url = $scope.url
        if (dataset)
            url = 'http://' + Config.datasets + '/datasets/' + dataset.uuid;

        wiggle.datasets.import({},
                               {url: url},
                               function(r) {
                                    var uuid = r.dataset;
                                    howl.join(uuid);
                                    $scope.datasets[uuid] = r;
                                    status.info('Importing ' + r.name + ' ' + r.version)
                                    if (dataset)
                                        dataset.imported = true;
                               });
    };

    $scope.delete = function(dataset) {

        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm Dataset Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete dataset <b>' +
                dataset.name + " v" + dataset.version + " (" + dataset.dataset + ")</b> Are you 100% sure you really want to do this?</p>"
        }, function() {
            wiggle.datasets.delete({id: dataset.dataset}, function() {
                delete $scope.datasets[dataset.dataset]
                status.success('Dataset deleted.')

                /* Search the remote dataset element, and set it as not imported. */
                var remoteDs = $scope.datasetsat.filter(function(i) { 
                    return i.uuid == dataset.dataset 
                }).pop()
                if (remoteDs) remoteDs.imported = false;
            })
        })

    }

    $scope.$on('progress', function(e, msg) {
        $scope.$apply(function() {
            $scope.datasets[msg.channel].imported = msg.message.data.imported;
        });
    })

    $scope.show = function() {

        wiggle.datasets.list(function (ids) {

            ids.length > 0 && status.update('Loading datasets', {total: ids.length})

            ids.forEach(function(id) {
                howl.join(id);

                $scope.datasets[id] = {}
                wiggle.datasets.get({id: id},
                                    function success(res) {
                                        if (res) $scope.datasets[id] = res
                                        status.update('Loading datasets', {add: 1})
                                    },
                                    function error (res) {
                                        //Maybe we should not even show the dataset?
                                        $scope.datasets[id] = {dataset: id}
                                        status.update('Loading datasets', {add: 1})
                                    }
                                   )

            })

            if (!Config.datasets)
                return status.error('Make sure your config has an URL for the remote datasets')

            datasetsat.datasets.list(function (data) {
                $scope.datasetsat = data.map(function(e) {
                    if ($scope.datasets[e.uuid]) {
                        e.imported = true;
                    } else {
                        e.imported = false;
                    }
                    return e;
                });
            });

        })
    }

    $scope.show()

});
