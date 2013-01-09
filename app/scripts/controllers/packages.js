'use strict';

fifoApp.controller('PackagesCtrl', function($scope, wiggle, status, modal) {

    $scope.packages = {}

    $scope.delete = function(el) {

        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm Package Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the package <b>' + el.pack.name + "</b> Are you 100% sure you really want to do this?</p>"
        }, function() {
            status.update('Will delete' + el.pack.name, {info: true})
            wiggle.packages.delete({id: el.pack.name})
        })

    }

    $scope.show = function() {

        wiggle.packages.list(function (ids) {

            ids.length > 0 && status.update('Loading packages', {total: ids.length})

            ids.forEach(function(id) {

                $scope.packages[id] = {name: id}
                wiggle.packages.get({id: id}, function(res) {
                    $scope.packages[id] = res
                    status.update('Loading packages', {add: 1})
                })

            })
        })
    }

    $scope.show()
});
