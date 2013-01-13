'use strict';

fifoApp.controller('VmCtrl', function($scope, $routeParams, $location, wiggle, vmService) {

    $scope.vm = wiggle.vms.get({id: $routeParams.uuid}, function(loaded) {
        vmService.updateCustomFields($scope.vm)
    })

    $scope.$on('state', function(e, msg) {
        $scope.vm.state = msg.message.data
        vmService.updateCustomFields($scope.vm)
        $scope.$apply()
    })

    $scope.$on('delete', function(e, msg) {
        $location.path('/virtual-machines')
        $scope.$apply()
    })

    $scope.action = function(action, vm) {
        vmService.executeAction(action, vm.uuid, vm.config && vm.config.alias, function() {
            if (action=='delete')
                $location.path('/virtual-machines')
        })
    }
});
