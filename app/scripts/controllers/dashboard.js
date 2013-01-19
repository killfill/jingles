'use strict';

fifoApp.controller('DashboardCtrl', function($scope, wiggle) {

    wiggle.cloud.get(function(data) {
        $scope.data = [
            {
                text: 'Allocated Memory',
                label: 'provisioned vs free',
                percent: parseInt(100 * data.metrics['provisioned-memory'] / (data.metrics['provisioned-memory']+data.metrics['free-memory']), 10)
            },
            {
                text: 'ARC usage',
                label: 'hits vs misses',
                percent: parseInt(100 * data.metrics['l1hits'] / (data.metrics['l1hits']+data.metrics['l1miss']), 10)
            },
            {
                text: 'Disk usage',
                label: 'used vs free',
                percent: parseInt(100 * data.metrics['used'] / data.metrics['size'], 10)
            }
        ]

        if (data.metrics["l2hits"] && data.metrics["l2miss"])
            $scope.data.push({
                text: 'L2 hits',
                label: 'hits vs misses',
                percent: parseInt(100 * data.metrics['l2hits'] / (data.metrics['l2hits']+data.metrics['l2miss']), 10)
            })
        })

});
