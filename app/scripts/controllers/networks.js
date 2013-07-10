'use strict';

fifoApp.controller('NetworksCtrl', function($scope, wiggle, status, modal) {
    $scope.setTitle('Networks')

    $scope.networks = {}

    $scope.delete = function(el) {
        console.log(el);
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm Network Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete network <b>' +
                el.name +"(" + el.uuid + ")</b> Are you 100% sure you really want to do this?</p>"
        }, function() {
            wiggle.networks.delete({id: el.uuid}, function success (data, h) {
                delete $scope.networks[el.uuid]
                status.success(el.name + ' deleted')
            }, function error(data) {
                console.error('Delete network error:', data)
                status.error('There was an error deleting your network. See the javascript console.')
            });
        })

    }

    $scope.show = function() {

        wiggle.networks.list(function (ids) {
            ids.length > 0 && status.update('Loading networks', {total: ids.length})

            ids.forEach(function(uuid) {
                $scope.networks[uuid] = {uuid: uuid}
                wiggle.networks.get({id: uuid}, function(res) {
                    $scope.networks[uuid] = res
                    status.update('Loading networks', {add: 1})
                })

            })
        })
    }

    $scope.show()
});
