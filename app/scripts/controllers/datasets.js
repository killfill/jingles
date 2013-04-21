'use strict';

fifoApp.controller('DatasetsCtrl', function($scope, wiggle, status, datasetsat, howl, modal) {
    $scope.setTitle('Datasets')

    $scope.datasets = {}
    $scope.datasetsat = {}
    $scope.endpoint = Config.datasets

    $scope.import = function(uuid) {
        var url = $scope.url
        if (uuid)
            url = 'http://' + Config.datasets + '/datasets/' + uuid;

        wiggle.datasets.import({},
                               {url: url},
                               function(r) {
                                    howl.join(uuid);
                                    $scope.datasets[uuid] = r;
                                    status.info('Importing ' + r.name + ' ' + r.version)
                                    if ($scope.datasetsat[uuid])
                                        $scope.datasetsat[uuid].imported = true;
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
                var remoteDs = $scope.datasetsat[dataset.dataset]
                if (remoteDs)
                    remoteDs.imported = false;
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

            /* Get the available datasets */
            datasetsat.datasets.list(function (data) {
                data.forEach(function(e) {
                    var localOne = $scope.datasets[e.uuid];
                    e.imported = localOne && localOne.imported && localOne.imported > 0 || false
                    $scope.datasetsat[e.uuid] = e
                })
            });

        })
    }

    $scope.show()

});
