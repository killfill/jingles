'use strict';

angular.module('fifoApp')
  .controller('UserCtrl', function ($scope, $routeParams, $location, wiggle, vmService, status) {
    var uuid = $routeParams.uuid;
    $scope.p2 = false;
    $scope.p3 = false;

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

    $scope.orgs = {}

    wiggle.orgs.list(function(ids) {
        ids.forEach(function(id) {
            $scope.orgs[id] = {uuid: id,
                                name: id}
            wiggle.orgs.get({id: id}, function(res) {
                $scope.orgs[id] = res;
            });
        });
    });

    $scope.org_join = function () {
        var org = $scope.org_to_join;
        wiggle.users.put({
            id: uuid,
            controller: "orgs",
            controller_id: org
        }, {}, function(e) {
            if ($scope.user.orgs.indexOf(org) == -1)
                $scope.user.orgs.push(org)
        });
    }

    $scope.org_select = function () {
        var org = $scope.user.org;
        wiggle.users.put({
            id: uuid,
            controller: "orgs",
            controller_id: org
        }, {active: true}, function(){});
    };

    $scope.org_leave = function (org) {
        wiggle.users.delete({
            id: uuid,
            controller: "orgs",
            controller_id: org
        }, function() {
            $scope.user.orgs = $scope.user.orgs.filter(function(o) {
                return o != org;
            });
        });
    };

    var update_permission = function(p) {
        var res = {
            text: p.join("->"),
            obj: p
        };
        var we_need_a_stupid_copy_thank_you_js = p.slice()
        if (p[1] && p[1] != "..." && p[1] != "_") {
            switch (p[0]) {
            case "users":
            case "groups":
            case "packages":
            case "dtraces":
            case "ipranges":
                cache(p[0], p[1], function (e) {
                    we_need_a_stupid_copy_thank_you_js[1] = e.name;
                    res.text = we_need_a_stupid_copy_thank_you_js.join("->");
                })
                break;
            case "datasets":
                cache(p[0], p[1], function (e) {
                    if (e.name && e.version) {
                        we_need_a_stupid_copy_thank_you_js[1] = e.name + " (" + e.version + ")";
                        res.text = we_need_a_stupid_copy_thank_you_js.join("->");
                    }
                });
                break;
            case "vms":
                cache(p[0], p[1], function (e) {
                    if (e.config && e.config.alias) {
                        we_need_a_stupid_copy_thank_you_js[1] = e.config.alias + "(" + p[1] + ")";
                        res.text = we_need_a_stupid_copy_thank_you_js.join("->");
                    }
                })
                break;
            }
        }
        return res;
    };

    wiggle.users.get({id: uuid}, function(res) {
        res.groups = res.groups || [];
        $scope.user = res;
        console.log(res);
        $scope.ssh_keys = $scope.user.mdata('ssh_keys')
        $scope.permissions = [];
        $scope.user._groups = {};
        if ($scope.user.keys.length == 0) {
            $scope.user.keys = {};
        };
        if (! $scope.user.yubikeys) {
            $scope.user.yubikeys = []
        }

        $scope.user.groups.map(function (gid){
            if ($scope.groups[gid]) {
                $scope.user._groups[gid] = $scope.groups[gid];
            } else {
                $scope.user._groups[gid] = {uuid: gid};
            }
        });
        $scope.permissions = res.permissions.map(update_permission);
    });

    $scope.delete_permission = function(permission) {
        var p = {controller: "permissions",
                 id: $scope.user.uuid};
        p.controller_id = permission[0];
        if (permission[1])
            p.controller_id1 = permission[1];
        if (permission[2])
            p.controller_id2 = permission[2];
        if (permission[3])
            p.controller_id3 = permission[3];
        wiggle.users.revoke(p, function success(){
            $scope.permissions = $scope.permissions.filter(function (pobj) {
                return pobj.obj != permission;
            })
        });
    };

    $scope.grant = function() {
        $scope.permission.id = $scope.user.uuid;
        $scope.permission.controller = "permissions";
        if ($scope.show_text) {
            $scope.permission["controller_id3"] = $scope.perm_text
        }

        wiggle.users.grant($scope.permission, function () {
            var p = [$scope.permission.controller_id];
            if ($scope.permission.controller_id1)
                p.push($scope.permission.controller_id1);
            if ($scope.permission.controller_id2)
                p.push($scope.permission.controller_id2);
            if ($scope.permission.controller_id3)
                p.push($scope.permission.controller_id3);

            $scope.permissions.push(update_permission(p));
        }, function(d) {
            console.log("failed:", d);
        });
        console.log($scope.permission);
    };

    $scope.perm_change = mk_permission_fn(wiggle, $scope);

    $scope.delete = function() {
        var name = $scope.user.name;
        var uuid = $scope.user.uuid;
        $scope.modal = {
            btnClass: 'btn-danger',
            confirm: 'Delete',
            title: 'Confirm VM Deletion',
            body: '<p><font color="red">Warning!</font> you are about to delete the User <b id="delete-uuid">' + name + " (" + uuid + ") </b> Are you 100% sure you really want to do this?</p><p>Clicking on Delete here will mean this User is gone forever!</p>",
            ok: function() {
				wiggle.users.delete({id: uuid},
	                function success(data, h) {
	                    status.success(name + ' deleted');
	                    $location.path('/configuration/users')
	                },
	                function error(data) {
	                    console.error('Delete User error:', data);
	                    status.error('There was an error deleting your user. See the javascript console.');
	                });
            }
        }
    };

    $scope.add_otp = function () {
        console.log($scope.otp);
    };

    $scope.add_otp = function() {
        console.log($scope.user);
        var otp = $scope.otp;
        var keyid = otp.slice(0, -32);
        var keys = $scope.user.yubikeys || [];
        if (keys.indexOf(keyid) == -1) {
            wiggle.users.put({id: $scope.user.uuid,
                              controller: 'yubikeys'},
                             {"otp": otp},
                             function() {
                                 keys[keys.length] = keyid;
                                 $scope.user.yubikeys = keys;
                             });
        }
        //$scope.user.mdata_set({ssh_keys: $scope.ssh_keys})
        //status.info('SSH key saved')
    }

    $scope.delete_yubikey = function(key) {
        wiggle.users.delete({id: $scope.user.uuid,
                             controller: 'yubikeys',
                             controller_id: key},
                            function(){
                                var idx = $scope.user.yubikeys.indexOf(key);
                                if (idx > -1) {
                                    $scope.user.yubikeys.splice(idx, 1);
                                }
                            });
    }

    $scope.passwd = function () {
        if ($scope.pass1 == $scope.pass2) {
            wiggle.users.put({id: $scope.user.uuid},
                             {password: $scope.pass1},
                             function() {
                                 status.success("Password for user " +
                                                $scope.user.name +
                                                " changed.");
                             });

        } else {
            status.error("Passwords don't match!");
        }
    }

    $scope.leave_group = function(group) {
        console.log("delete:", $scope.group);
        wiggle.users.delete({id: $scope.user.uuid,
                             controller: 'groups',
                             controller_id: group},
                            function(){
                                delete $scope.user._groups[group];
                            });
    };

    $scope.group_join = function() {
        console.log("join:", $scope.group);
        wiggle.users.put({id: $scope.user.uuid,
                          controller: 'groups',
                          controller_id: $scope.group},
                         function() {
                             $scope.user._groups[$scope.group] = $scope.groups[$scope.group];
                         }
                        );
    };

    $scope.delete_sshkey = function(key) {
        wiggle.users.delete({id: $scope.user.uuid,
                             controller: 'keys',
                             controller_id: key},
                            function(){
                                delete $scope.user.keys[key];
                            });
    }

    $scope.save_sshkeys = function() {
        var key = $scope.ssh_keys;
        var key_id = key.split(" ")[2];
        var o = {};
        o[key_id] = key;
        wiggle.users.put({id: $scope.user.uuid,
                          controller: 'keys'},
                         o,
                         function() {
                             console.log($scope.user.keys);
                             $scope.user.keys[key_id] = key;
                             console.log($scope.user.keys);
                         });
        //$scope.user.mdata_set({ssh_keys: $scope.ssh_keys})
        //status.info('SSH key saved')
    }

    $scope.init = function() {
        $scope.pass1 = "";
        $scope.pass2 = "";
        $scope.groups = [];
        wiggle.groups.list(function(ids) {
            ids.forEach(function(gid) {
                wiggle.groups.get({id: gid}, function(g) {
                    $scope.groups[gid] = g;
                    if ($scope.user._groups[gid]) {
                        $scope.user._groups[gid] = g;
                    }
                });
            });
        })
    };
    $scope.init();

  });
