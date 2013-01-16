'use strict';

fifoApp.controller('VmCtrl', function($scope, $routeParams, $location, wiggle, vmService) {

     wiggle.vms.get({id: $routeParams.uuid}, function(res) {
        $scope.vm = vmService.updateCustomFields(res)
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

    $scope.vnc = function(vm) {
        window.open("vnc.html?uuid=" + vm.uuid)
    }
});
