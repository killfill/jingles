'use strict';

angular.module('fifoApp')
  .controller('PackagesCtrl', function ($scope, wiggle, status) {

    $scope.packages = {}

    $scope.delete = function(el) {

        $scope.modal = {
            btnClass: 'btn-danger',
            confirm: 'Delete',
            title: 'Confirm Package Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the package <b>' +
                el.pack.name +"(" + el.pack.uuid + ")</b> Are you 100% sure you really want to do this?</p>",
            ok: function() {
                wiggle.packages.delete({id: el.pack.uuid},
                    function success (data, h) {
                        status.success(el.pack.name + ' deleted');
                        delete $scope.packages[el.pack.uuid];
                    },
                    function error (data) {
                        console.error('Delete package error:', data);
                        status.error('There was an error deleting your packge. See the javascript console.');
                    }
                )
            }
        }

    }

    $scope.show = function() {

        wiggle.packages.list(function (ids) {

            ids.forEach(function(uuid) {

                $scope.packages[uuid] = {uuid: uuid}
                wiggle.packages.get({id: uuid}, function(res) {
                    $scope.packages[uuid] = res
                })

            })
        })
    }

    $scope.show()
  });
