'use strict';

fifoApp.controller('DashboardCtrl', function($scope, wiggle) {
    $scope.setTitle('Dashboard')

    var roundedInt = function(num) {
        return parseInt(Math.round(num), 10)
    }

    wiggle.cloud.get(function(data) {
        $scope.data = [
            {
                text: 'Allocated Memory',
                label: 'provisioned vs free',
                percent: roundedInt(100 * data.metrics['provisioned-memory'] / (data.metrics['provisioned-memory']+data.metrics['free-memory']))
            },
            {
                text: 'ARC usage',
                label: 'hits vs misses',
                percent: roundedInt(100 * data.metrics['l1hits'] / (data.metrics['l1hits']+data.metrics['l1miss']))
            },
            {
                text: 'Disk usage',
                label: 'used vs free',
                percent: roundedInt(100 * data.metrics['used'] / data.metrics['size'])
            }
        ]

        if (data.metrics["l2hits"] && data.metrics["l2miss"])
            $scope.data.push({
                text: 'L2 hits',
                label: 'hits vs misses',
                percent: roundedInt(100 * data.metrics['l2hits'] / (data.metrics['l2hits']+data.metrics['l2miss']))
            })
        })

});
