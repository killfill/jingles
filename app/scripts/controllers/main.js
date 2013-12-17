'use strict';

angular.module('fifoApp')
  .controller('MainCtrl', function ($scope, wiggle, auth, $interval) {

    $scope.msgTrClass = function(type) {
        return type == 'critical' ? 'danger': type;
    }

    $scope.messages = false
    $scope.show = function() {
        $scope.user = auth.currentUser()
        if (!$scope.user) return;

        $scope.activeOrg = wiggle.orgs.get({id: $scope.user.org})
        $scope.keys = Object.keys($scope.user.keys).length

        wiggle.cloud.get(function res (data) {
            $scope.metrics = data.metrics
            $scope.versions = data.versions
            $scope.messages = Config.evaluate_cloud(data.metrics).concat(data.warnings)
            $scope.adjustMessage = Config.adjustMessage
            $scope.cloud_ok = $scope.messages.filter(function(i) {
                /* Msg from the server has no ok attr, so set it. */
                i.ok = !!i.ok;
                return !i.ok;
            }).length < 1

            $scope.cloud_status = $scope.cloud_ok ? 'images/healthy-cluster.png' : 'images/unhealthy-cluster.png'
        })

    }

    // $cookies["x-snarl-token"] && $scope.show()

    /* Update data on memory change */
    $scope.$on('memorychange', $scope.show);
    $interval($scope.show, 1000 * (Config.statusPolling || 10))
    $scope.show();

  });
