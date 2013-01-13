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

            /* We could add this to fix when user created a vm from another gui, so reloading the vm list will join the missing howl channel
            But maybe there could be a event to let the gui know that a new vm was created!
            Same when a new VM is created.
            wiggle.vms.list(howl.join)
            */

            ids.length > 0 && status.update('Loading machines', {total: ids.length})

            ids.forEach(function(id) {

                $scope.vms[id] = {uuid: id, state: 'loading'}
                wiggle.vms.get({id: id}, function(res) {

                    status.update('Loading machines', {add: 1})
                    //If the vm is deleting, just ignore them.
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

            /* When creating a new VM, we get events from howl telling about the state.
               So when the machine is booting get the main info via wiggle */
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

});
