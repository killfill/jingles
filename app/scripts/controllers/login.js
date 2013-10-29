'use strict';

angular.module('fifoApp')
  .controller('LoginCtrl', function ($scope, auth, $timeout, wiggle, $location) {

    $scope.submit = function() {
    	auth.login($scope.user, $scope.password)
    }

    $scope.$on('auth:login_ok', function() {
    	$scope.password = null
    })

    $scope.$on('auth:login_error', function(ev, res) {
        if (res.data)
            $scope.loginError = res.data + ' ('+res.status+')'
        else
            $scope.loginError = 'Error ' + res.status

        $timeout(function() {
            $scope.loginError = false
        }, 4*1000)
    })

    $scope.connectionStatus = {
        msg: 'Connecting...'
    }
    var statusWrapper = function() {
        var t = $scope.connectionStatus.ok? 15000: 5000;
        $scope.poller = $timeout(checkBackendStatus, t);
    }
    /* Check the backend status */
    var checkBackendStatus = function() {
        wiggle.cloud.get({controller: 'connection'}, 
            function(res) {
                $scope.connectionStatus.ok = (res.howl > 0 && res.snarl > 0 && res.sniffle > 0)
                $scope.connectionStatus.msg = 'Not connected: ' + res
                statusWrapper()
            }, 
            function err() {
                $scope.connectionStatus.ok = false
                $scope.connectionStatus.msg = 'No connection'
                statusWrapper()
            }
        )
    }
    checkBackendStatus()

    $scope.$on('$destroy', function() {
        $timeout.cancel($scope.poller);
    })

  });
