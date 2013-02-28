'use strict';

fifoApp.controller('DTracesCtrl', function($scope, wiggle, status, modal) {

    $scope.dtraces = {}

    $scope.delete = function(el) {
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm DTrace Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the dtrace <b>' +
                el.dt.name +"(" + el.dt.uuid + ")</b> Are you 100% sure you really want to do this?</p>"
        }, function() {
            status.info('Will delete' + el.dt.name +"(" + el.dt.uuid + ")");
            wiggle.dtrace.delete({id: el.dt.uuid},
                                 function success (data, h) {
                                     delete $scope.dtraces[el.dt.uuid];
                                 },
                                 function error (data) {
                                     console.error('Delete dtrace error:', data);
                                     alert('There was an error deleting your packge. See the javascript console.');
                                 })
        })

    }

    $scope.show = function() {

        wiggle.dtrace.list(function (ids) {

            ids.length > 0 && status.update('Loading dtraces', {total: ids.length})

            ids.forEach(function(uuid) {

                $scope.dtraces[uuid] = {uuid: uuid}
                wiggle.dtrace.get({id: uuid}, function(res) {
                    $scope.dtraces[uuid] = res
                    status.update('Loading dtraces', {add: 1})
                })

            })
        })
    }

    $scope.show()
});
