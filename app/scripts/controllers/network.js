'use strict';

fifoApp.controller('NetworkCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    $scope.setTitle('Network details')
    var uuid = $routeParams.uuid;


    var cache=(function(){
        var c = {};
        return function(entity, e, callback) {
            if (!c[entity])
                c[entity] = {};
            if (c[entity][e]) {
                callback(c[entity][e]);
            } else {
                wiggle[entity].get({id: e}, function(elem) {
                    c[entity][e] = elem;
                    callback(elem);
                })
            }
        }
    })();


    wiggle.networks.get({id: uuid}, function(res) {
        res.ipranges = res.ipranges || [];
        $scope.network = res;
        $scope.network._ipranges = {};

        $scope.network.ipranges.map(function (gid){
            if ($scope.ipranges[gid]) {
                $scope.network._ipranges[gid] = $scope.ipranges[gid];
            } else {
                $scope.network._ipranges[gid] = {uuid: gid};
            }
        });
    });

    $scope.delete = function() {
        var name = $scope.network.name;
        var uuid = $scope.network.uuid;
        modal.confirm({
            btnClass: 'btn-danger',
            btnText: 'Delete',
            header: 'Confirm VM Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the Network <b id="delete-uuid">' + name + " (" + uuid + ") </b> Are you 100% sure you really want to do this?</p><p>Clicking on Delete here will mean this Network is gone forever!</p>"
        }, function() {
            wiggle.networks.delete({id: uuid},
                                   function success(data, h) {
                                       status.success(name + ' deleted');
                                       $location.path('/networks')
                                   },
                                   function error(data) {
                                       console.error('Delete Network error:', data);
                                       status.error('There was an error deleting your network. See the javascript console.');
                                   });
        })
    };

    $scope.remove_iprange = function(iprange) {
        console.log("delete:", $scope.iprange);
        wiggle.networks.delete({id: $scope.network.uuid,
                                controller: 'ipranges',
                                controller_id: iprange},
                               function(){
                                   delete $scope.network._ipranges[iprange];
                               });
    };

    $scope.add_iprange = function() {
        console.log("add:", $scope.iprange);
        wiggle.networks.put({id: $scope.network.uuid,
                             controller: 'ipranges',
                             controller_id: $scope.iprange},
                            function() {
                                $scope.network._ipranges[$scope.iprange] = $scope.ipranges[$scope.iprange];
                            }
                           );
    };

    $scope.init = function() {
        $scope.pass1 = "";
        $scope.pass2 = "";
        $scope.ipranges = {};
        wiggle.ipranges.list(function(ids) {
            ids.forEach(function(gid) {
                wiggle.ipranges.get({id: gid}, function(g) {
                    $scope.ipranges[gid] = g;
                    if ($scope.network._ipranges[gid]) {
                        $scope.network._ipranges[gid] = g;
                    }
                });
            });
        })
    };
    $scope.init();
})
