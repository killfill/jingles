'use strict';

fifoApp.controller('IprangesCtrl', function($scope, wiggle, status, modal) {
    $scope.setTitle('Ipranges')

    $scope.ipranges = {}

    $scope.delete = function(el) {
        console.log(el);
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm Iprange Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete iprange <b>' +
                el.name +"(" + el.uuid + ")</b> Are you 100% sure you really want to do this?</p>"
        }, function() {
            wiggle.ipranges.delete({id: el.uuid}, function success (data, h) {
                delete $scope.ipranges[el.uuid]
                status.success(el.name + ' deleted')
            }, function error(data) {
                console.error('Delete iprange error:', data)
                status.error('There was an error deleting your iprange. See the javascript console.')
            });
        })

    }

    $scope.show = function() {

        wiggle.ipranges.list(function (ids) {

            ids.length > 0 && status.update('Loading ipranges', {total: ids.length})

            ids.forEach(function(uuid) {
                $scope.ipranges[uuid] = {uuid: uuid}
                wiggle.ipranges.get({id: uuid}, function(res) {
                    var cur = res.current.split(/\./);
                    var last = res.last.split(/\./);
                    var c = 0;
                    var l = 0;
                    for (var x=0; x<4; x++){
                        c += Math.pow(256, 3-x)*cur[x];
                        l += Math.pow(256, 3-x)*last[x];
                    };
                    $scope.ipranges[uuid] = res
                    $scope.ipranges[uuid].full = (c > l);
                    status.update('Loading ipranges', {add: 1})
                })

            })
        })
    }

    $scope.show()
});
