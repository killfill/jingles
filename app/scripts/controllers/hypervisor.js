'use strict';

fifoApp.controller('HypervisorCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    var uuid = $routeParams.uuid;

    wiggle.hypervisors.get({id: uuid}, function(res) {
        $scope.hyper = res; //vmService.updateCustomFields(res)

    });

})
