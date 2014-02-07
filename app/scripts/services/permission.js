
function mk_permission_fn(wiggle, $scope) {
    return function(level) {
        delete $scope.permission;
        switch(level) {

        case 3:
            if ($scope.perm3 == "ssh") {
                $scope.show_text = true;
            } else {
                $scope.show_text = false;
            }
            $scope.permission =
                {controller_id: $scope.perm1,
                 controller_id1: $scope.perm2,
                 controller_id2: $scope.perm3};


            break;
        case 1:
            $scope.show_text = false;
            $scope.p2 = false;
            $scope.p3 = false;
            $scope.perm2 = "";
            $scope.perm3 = "";
            switch($scope.perm1) {
            case "...":
                $scope.permission = {controller_id: "..."};
                break;
            case "cloud":
                $scope.p2 = {
                    "cloud": {id: "cloud", name: "Cloud"},
                    "datasets": {id: "datasets", name: "Datasets"},
                    "dtraces": {id: "dtraces", name: "DTrace"},
                    "groups": {id: "groups", name: "Groups"},
                    "hypervisors": {id: "hypervisors", name: "Hypervisors"},
                    "ipranges": {id: "ipranges", name: "IP Ranges"},
                    "networks": {id: "networks", name: "Networks"},
                    "orgs": {id: "orgs", name: "Organizations"},
                    "packages": {id: "packages", name: "Packages"},
                    "users": {id: "users", name: "Users"},
                    "vms": {id: "vms", name: "Virtual Machines"},
                };
                break;
            case "channels":
                $scope.p2 = {}
                wiggle.hypervisors.list(function(ids) {
                    ids.forEach(function(id) {
                        wiggle.hypervisors.get({id: id}, function(res) {
                            $scope.p2[res.uuid] = {id: res.uuid, name: 'Server ' + res.alias}
                        })      
                    })
                })
                wiggle.vms.list(function(ids) {
                    ids.forEach(function(id) {
                        wiggle.vms.get({id: id}, function(res) {
                            $scope.p2[res.uuid] = {id: res.uuid, name: 'Machine ' + res.config.alias}
                        })
                    })
                })
                break;
            case "dtraces":
                wiggle.dtrace.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Dtraces"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.dtrace.get({id: id}, function(dtrace) {
                            $scope.p2[id].name = dtrace.name;
                        })
                    })
                });
                break;
            case "users":
                wiggle.users.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Users"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.users.get({id: id}, function(user) {
                            $scope.p2[id].name = user.name;
                        })
                    })
                });
                break;
            case "orgs":
                wiggle.orgs.query(function(orgs) {
                    $scope.p2 = {
                        '...': {id: '...', name: 'Everything'},
                        '_': {id: '_', name: 'All Orgs'},
                    }
                    orgs.forEach(function(org) {
                        $scope.p2[org.uuid] = {id: org.uuid, name: org.name}
                    })
                })
                break;
            case "groups":
                wiggle.groups.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Groups"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.groups.get({id: id}, function(group) {
                            $scope.p2[id].name = group.name;
                        })
                    })
                });
                break;
            case "hypervisors":
                wiggle.hypervisors.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Hypervisors"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                    })
                });
                break;
            case "vms":
                wiggle.vms.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Virtual Machines"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.vms.get({id: id}, function(vm) {
                            var name = id;
                            if (vm.config && vm.config.alias)
                                name = name + " (" + vm.config.alias + ")";
                            $scope.p2[id].name = name;
                        })
                    })
                });
                break;
            case "datasets":
                wiggle.datasets.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Datasets"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.datasets.get({id: id}, function(ds) {
                            $scope.p2[id].name = ds.name + " " + ds.version;
                        })
                    })
                });
                break;
            case "packages":
                wiggle.packages.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Packages"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.packages.get({id: id}, function(ipr) {
                            $scope.p2[id].name = ipr.name + " (" + id + ")";
                        });

                    })
                });
                break;
            case "ipranges":
                wiggle.ipranges.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Networks"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.ipranges.get({id: id}, function(ipr) {
                            $scope.p2[id].name = ipr.name + " (" + id + ")";
                        });
                    })
                });
                break;
            case "networks":
                wiggle.networks.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Networks"},
                        };
                    ids.forEach(function(id){
                        $scope.p2[id] = {id: id, name: id};
                        wiggle.networks.get({id: id}, function(ipr) {
                            $scope.p2[id].name = ipr.name + " (" + id + ")";
                        });
                    })
                });
                break;

            }
            break;
        case 2:
            $scope.show_text = false;
            $scope.p3 = false;
            $scope.perm3 = "";
            if ($scope.perm2 == "...") {
                $scope.permission = {controller_id: $scope.perm1,
                                     controller_id1: "..."};
            } else {
                switch($scope.perm1) {
                case "cloud":
                    switch($scope.perm2) {
                    case "cloud":
                        $scope.p3 = [
                            {id: "status", name: "Status"}
                        ]
                        break;
                    case "vms":
                        $scope.p3 = [
                            {id: "list", name: "List"},
                            {id: "create", name: "Create"},
                            {id: "advanced_create", name: "Advanced Create"}
                        ];
                        break;
                    case "users":
                    case "groups":
                    case "packages":
                    case "dtraces":
                    case "ipranges":
                    case "networks":
                    case "orgs":
                        $scope.p3 = [
                            {id: "list", name: "List"},
                            {id: "create", name: "Create"}
                        ];
                        break;
                    case "datasets":
                        $scope.p3 = [
                            {id: "list", name: "List"},
                            {id: "import", name: "Import"}
                        ]
                        break;
                    case "hypervisors":
                        $scope.p3 = [
                            {id: "list", name: "List"}
                        ]
                        break;
                    }
                    break;
                case "users":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"passwd", name: "Change Password"},
                        {id:"delete", name: "Delete"},
                        {id:"grant", name: "Grant a Permission"},
                        {id:"revoke", name: "Revoke a Permission"},
                        {id:"join", name: "Join a group"},
                        {id:"leave", name: "Leave a group"}
                    ];
                    break;
                case "orgs":
                    $scope.p3 = [
                        {id: "list", name: "List"},
                        {id: "get", name: "See"},
                        {id: "edit", name: "Edit"},
                        {id: "delete", name: "Delete"},
                        {id: "create", name: "Create"}
                    ]
                    break;
                case "groups":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"delete", name: "Delete"},
                        {id:"grant", name: "Grant a Permission"},
                        {id:"revoke", name: "Revoke a Permission"},
                        {id:"join", name: "Join this group"},
                        {id:"leave", name: "Leave this group"}
                    ];
                    break;
                case "channels":
                    $scope.p3 = [
                        {id: 'join', name: 'Join'},
                        {id: 'leave', name: 'Leave'},
                    ]
                    break;
                case "vms":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"state", name: "State"},
                        {id:"delete", name: "Delete"},
                        {id:"console", name: "Console/VNC"},
                        {id:"snapshot", name: "Create a Snapshot"},
                        {id:"rollback", name: "Rollback a Snapshot"},
                        {id:"edit", name: "Edit"},
                        {id:"snapshot_delete", name: "Delete a Snapshot"},
                        {id:"ssh", name:"SSH Login"}
                    ];
                    break;
                case "dtraces":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"create", name: "Create VM's here"},
                        {id:"edit", name: "Edit"},
                        {id:"stream", name: "Stream"},
                        {id:"delete", name: "Delete"}
                    ];
                    break;
                case "hypervisors":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"create", name: "Create VM's here"},
                        {id:"edit", name: "Edit Metadata"}
                    ];
                    break;
                case "networks":
                case "ipranges":
                case "packages":
                case "datasets":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"delete", name: "Delete"},
                        {id:"edit", name: "Edit"},
                        {id:"create", name: "Create"},
                    ];
                    break;
                }
                if ($scope.p3) {
                    $scope.p3.unshift({'id': '...', name:'Everything'});
                }
            }
        };
    };
};