'use strict';

angular.module('fifoApp')
  .controller('DtracesCtrl', function ($scope, wiggle, status) {
 
    $scope.dtraces = {}

    $scope.delete = function(el) {
        $scope.modal = {
            btnClass: 'btn-danger',
            confirm: 'Delete',
            title: 'Confirm DTrace Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the dtrace <b>' +
                el.dt.name +"(" + el.dt.uuid + ")</b> Are you 100% sure you really want to do this?</p>", 
            ok: function() {
                wiggle.dtrace.delete({id: el.dt.uuid},
                                 function success (data, h) {
                                     delete $scope.dtraces[el.dt.uuid];
                                     status.success('Script ' + el.dt.name + ' deleted');
                                 },
                                 function error (data) {
                                     console.error('Delete dtrace error:', data);
                                     alert('There was an error deleting your packge. See the javascript console.');
                                 })
            }
        }
    }

    $scope.show = function() {

        wiggle.dtrace.list(function (ids) {

            ids.forEach(function(uuid) {
                $scope.dtraces[uuid] = {uuid: uuid}
                wiggle.dtrace.get({id: uuid}, function(res) {
                    $scope.dtraces[uuid] = res
                })

            })
        })
    }

    $scope.show()
  });
