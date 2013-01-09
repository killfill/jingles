'use strict';

fifoApp.controller('HypervisorsCtrl', function($scope, wiggle, status) {

    $scope.hypervisors = {}

    $scope.show = function() {

        wiggle.hypervisors.list(function (ids) {

            ids.length > 0 && status.update('Loading hypervisors', {total: ids.length})

            ids.forEach(function(id) {

                $scope.hypervisors[id] = {name: id}
                wiggle.hypervisors.get({id: id}, function(res) {
                    $scope.hypervisors[id] = res
                    status.update('Loading hypervisors', {add: 1})
                })

            })
        })

        $scope.$on('memorychange', function(e, msg) {
            $scope.hypervisors[msg.channel]['free-memory']        = msg.message.data.free
            $scope.hypervisors[msg.channel]['provisioned-memory'] = msg.message.data.provisioned
            $scope.$apply()
        })
    }

    $scope.show()
});
