'use strict';

fifoApp.controller('NetworksCtrl', function($scope, wiggle, status, modal) {

    $scope.networks = {}

    $scope.delete = function(el) {

        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm Network Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete network <b>' + el.net.name + "</b> Are you 100% sure you really want to do this?</p>"
        }, function() {
            status.update('Will delete' + el.net.name, {info: true})
            wiggle.ipranges.delete({id: el.net.name},
                function success (data, h) {
                    delete $scope.networks[el.net.name]
                },
                function error(data) {
                    console.error('Delete network error:', data)
                    alert('There was an error deleting your network. See the javascript console.')
                }
            )

        })

    }

    $scope.show = function() {

        wiggle.ipranges.list(function (ids) {

            ids.length > 0 && status.update('Loading networks', {total: ids.length})

            ids.forEach(function(name) {

                $scope.networks[name] = {name: name}
                wiggle.ipranges.get({id: name}, function(res) {
                    $scope.networks[name] = res
                    status.update('Loading networks', {add: 1})
                })

            })
        })
    }

    $scope.show()
});
