'use strict';

fifoApp.controller('Virtual-MachinesCtrl', function($scope, wiggle, status, modal, howl, vmService) {

    $scope.vms = {}

    $scope.action = function(action, vm) {
        vmService.executeAction(action, vm.uuid, vm.config && vm.config.alias, function() {
            if (action=='delete')
                $location.path('/virtual-machines')
        })
    }
    $scope.vnc = function(vm) {
        window.open("/app/vnc.html?uuid=" + vm.uuid);
    };

    $scope.show = function() {

        wiggle.vms.list(function (ids) {

            ids.length > 0 && status.update('Loading machines', {total: ids.length})

            ids.forEach(function(id) {

                $scope.vms[id] = {uuid: id, state: 'loading'}
                wiggle.vms.get({id: id}, function(res) {

                    status.update('Loading machines', {add: 1})
                    //If the vm is deleting, delete them from the list..
                    if (res.state == 'deleting')
                        delete $scope.vms[id];
                    else
                        $scope.vms[id] = vmService.updateCustomFields(res);

                })
            })
        })

        $scope.$on('state', function(e, msg) {

            //When deleting a vm, the shut_down and stop events are sent after the delete event (i.e. when the vm is running)
            if (!$scope.vms[msg.channel]) return;

            $scope.vms[msg.channel].state = msg.message.data
            vmService.updateCustomFields($scope.vms[msg.channel])
            $scope.$apply()

            /* When creating a new VM, we get events from howl telling just about the state.
               So when the machine is creating get the main info via wiggle */
            if (msg.message.data == 'creating' && !$scope.vms[msg.channel].config) {
                $scope.vms[msg.channel] = wiggle.vms.get({id: msg.channel})
            }
        })

        $scope.$on('delete', function(e, msg) {
            delete $scope.vms[msg.channel]
            $scope.$apply()
        })

    }

    $scope.show()


    /* Ordering stuff: If any other table need something like this, probably a directive would be greate. */
    $scope.orderField = 'config.alias';
    $scope.order = function(field) {
        /* Change to asc or desc */
        if (field == $scope.orderField && $scope.orderField[0] != '-')
            $scope.orderField = '-' + field
        else
            $scope.orderField = field;
    }
    $scope.orderStyle = function(field) {

        if ($scope.orderField.indexOf(field) < 0)
            return;

        if ($scope.orderField[0] == '-')
            return 'clickable sorted-down'
        else
            return 'clickable sorted-up'
    }


});
