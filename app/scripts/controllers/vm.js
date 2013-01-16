'use strict';

fifoApp.controller('VmCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {

    var uuid = $routeParams.uuid;

    wiggle.vms.get({id: uuid}, function(res) {
        $scope.vm = vmService.updateCustomFields(res)
        $scope.snapshots = $scope.vm.snapshots
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

    $scope.snapshot = function(action, snap) {
        switch (action) {

            case 'create':
                var comment = prompt('Write a comment for the new snapshot:');
                wiggle.vms.save({id: uuid, controller: 'snapshots'}, {comment: comment},
                    function success() {
                        getSnapshots();
                    },
                    function error(data) {
                        alert('Error saving the snapshot. See your console')
                        console.log(data)
                    });

                break;

            case 'delete':
                modal.confirm({
                    btnClass: 'btn-info',
                    btnText: 'Delete',
                    header: 'Confirm Snapshot Deletion',
                    body: '<p>Are you sure you want to delete snapshot <strong>' + snap.comment + '</strong> from ' + new Date(snap.timestamp/1000) + '</p>'
                }, function() {
                    status.update('Will delete snapshot ' + snap.comment, {info: true});
                    $scope.$apply()
                    wiggle.vms.delete({id: uuid, controller: 'snapshots', second_id: snap.uuid},
                        function success() {
                            //Update the snapshot list
                            wiggle.vms.get({id: uuid, controller: 'snapshots'}, function(res) {
                                $scope.snapshots = res
                            })
                        },
                        function error(data) {
                            alert('Error deleting the snapshot. See your console')
                            console.log(data)
                        })
                })
                break;

            case 'rollback':
                modal.confirm({
                    btnClass: 'btn-danger',
                    btnText: 'Rollback',
                    header: 'Confirm Rollback',
                    body: '<p><font color="red">Warning!</font> you are about to rollback VM <b id="delete-uuid">' + uuid + " "+ ($scope.vm.config.alias? '(' + $scope.vm.config.alias + ')': '') + '</b> to snapshot <strong>' + snap.comment + '</strong> from ' + new Date(snap.timestamp/1000) + '</p>' +
                        "</b> Are you 100% sure you really want to do this?</p>"
                }, function() {
                    status.update('Will rollback to snapshot ' + snap.comment, {info: true});
                    $scope.$apply()
                    wiggle.vms.put({id: uuid, controller: 'snapshots', second_id: snap.uuid}, {action: 'rollback'},
                        function sucess () {
                        },
                        function error (data) {
                            alert('Error when rolling back. See your console')
                            console.log(data)
                        })
                })
                break;
        }

    }
});
