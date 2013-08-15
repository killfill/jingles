'use strict';

var fifoApp = angular.module('fifoApp', ['ngResource', 'ngCookies', 'fifoHooks'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    })
    .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
    })
    .when('/status', {
        templateUrl: 'views/status.html',
        controller: 'StatusCtrl'
    })
    .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl'
    })
    .when('/dtrace/new', {
        templateUrl: 'views/new_dtrace.html',
        controller: 'NewDtraceCtrl'
    })
    .when('/dtrace/:uuid', {
        templateUrl: 'views/dtrace.html',
        controller: 'DTraceCtrl'
    })
    .when('/dtrace', {
        templateUrl: 'views/dtraces.html',
        controller: 'DTracesCtrl'
    })
    .when('/virtual-machines', {
        templateUrl: 'views/virtual-machines.html',
        controller: 'Virtual-MachinesCtrl'
    })
    .when('/virtual-machines/new', {
        templateUrl: 'views/new_vm.html',
        controller: 'NewVmCtrl'
    })
    .when('/virtual-machines/:uuid', {
        templateUrl: 'views/vm.html',
        controller: 'VmCtrl'
    })
    .when('/hypervisors/:uuid', {
        templateUrl: 'views/hypervisor.html',
        controller: 'HypervisorCtrl'
    })
    .when('/hypervisors', {
        templateUrl: 'views/hypervisors.html',
        controller: 'HypervisorsCtrl'
    })
    .when('/ipranges', {
        templateUrl: 'views/ipranges.html',
        controller: 'IprangesCtrl'
    })
    .when('/ipranges/new', {
        templateUrl: 'views/new_iprange.html',
        controller: 'NewIprangeCtrl'
    })
    .when('/networks', {
        templateUrl: 'views/networks.html',
        controller: 'NetworksCtrl'
    })
    .when('/networks/new', {
        templateUrl: 'views/new_network.html',
        controller: 'NewNetworkCtrl'
    })
    .when('/networks/:uuid', {
        templateUrl: 'views/network.html',
        controller: 'NetworkCtrl'
    })
    .when('/datasets', {
        templateUrl: 'views/datasets.html',
        controller: 'DatasetsCtrl'
    })
    .when('/datasets/:uuid', {
        templateUrl: 'views/dataset.html',
        controller: 'DatasetCtrl'
    })
    .when('/packages', {
        templateUrl: 'views/packages.html',
        controller: 'PackagesCtrl'
    })
    .when('/package/:uuid', {
        templateUrl: 'views/package.html',
        controller: 'PackageCtrl'
    })
    .when('/packages/new', {
        templateUrl: 'views/new_package.html',
        controller: 'NewPackageCtrl'
    })
    .when('/groups', {
        templateUrl: 'views/groups.html',
        controller: 'GroupsCtrl'
    })
    .when('/groups/new', {
        templateUrl: 'views/new_group.html',
        controller: 'NewGroupCtrl'
    })
    .when('/groups/:uuid', {
        templateUrl: 'views/group.html',
        controller: 'GroupCtrl'
    })
    .when('/orgs', {
        templateUrl: 'views/orgs.html',
        controller: 'OrgsCtrl'
    })
    .when('/orgs/new', {
        templateUrl: 'views/new_org.html',
        controller: 'NewOrgCtrl'
    })
    .when('/orgs/:uuid', {
        templateUrl: 'views/org.html',
        controller: 'OrgCtrl'
    })
    .when('/users', {
        templateUrl: 'views/users.html',
        controller: 'UsersCtrl'
    })
    .when('/users/new', {
        templateUrl: 'views/new_user.html',
        controller: 'NewUserCtrl'
    })
    .when('/users/:uuid', {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl'
    })
    .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
    })
    .when('/graph', {
        templateUrl: 'views/graph.html',
        controller: 'GraphCtrl'
    })

    .otherwise({
        redirectTo: '/status'
    });

    //Replace # with pushstates:
    //$locationProvider.html5Mode(false); //.hashPrefix('!');
}])
.run(function ($http, $cookies, user, wiggle, hookListener) {

    /* This is an accepted bug in angularjs.. 1.1.1 has this 'fixed' */
    delete $http.defaults.headers.common['X-Requested-With']

    var token = $cookies["x-snarl-token"];

    if (token)
        wiggle.sessions.get({id: token},
            function success(data) {
                user.login(data)
            },
            function error() {
                user.logout();
            })
    else
        //logout() checks for the connection status ;)
        user.logout();

    })

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
                    "users": {id: "users", name: "Users"},
                    "groups": {id: "groups", name: "Groups"},
                    "hypervisors": {id: "hypervisors", name: "Hypervisors"},
                    "vms": {id: "vms", name: "Virtual Machines"},
                    "networks": {id: "networks", name: "Networks"},
                    "ipranges": {id: "ipranges", name: "IP Ranges"},
                    "datasets": {id: "datasets", name: "Datasets"},
                    "packages": {id: "packages", name: "Packages"},
                    "dtraces": {id: "dtraces", name: "DTrace"},
                };
                break;
            case "dtraces":
                wiggle.dtrace.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Users"},
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
            case "groups":
                wiggle.groups.list(function(ids) {
                    if (ids.length > 0)
                        $scope.p2 = {
                            "...": {id: "...", name: "Everything"},
                            "_": {id: "_", name: "All Users"},
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
                    case "users":
                    case "groups":
                    case "vms":
                    case "packages":
                    case "dtraces":
                    case "ipranges":
                    case "networks":
                        $scope.p3 = [
                            {id: "list", name: "List"},
                            {id: "create", name: "Create"}
                        ];
                        break;
                    case "datasets":
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
                case "vms":
                    $scope.p3 = [
                        {id:"get", name: "See"},
                        {id:"start", name: "Start"},
                        {id:"stop", name: "Stop"},
                        {id:"reboot", name: "Reboot"},
                        {id:"delete", name: "Delete"},
                        {id:"console", name: "Console/VNC"},
                        {id:"snapshot", name: "Create a Snapshot"},
                        {id:"rollback", name: "Rollback a Snapshot"},
                        {id:"edit", name: "Edit"},
                        {id:"delete_snapshot", name: "Delete a Snapshot"},
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
                        {id:"delete", name: "Delete"}
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
