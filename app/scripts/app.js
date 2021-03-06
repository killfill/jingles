'use strict';

var fifoApp = angular.module('fifoApp', ['ngResource', 'ngCookies'])
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
    .when('/hypervisors', {
        templateUrl: 'views/hypervisors.html',
        controller: 'HypervisorsCtrl'
    })
    .when('/networks', {
        templateUrl: 'views/networks.html',
        controller: 'NetworksCtrl'
    })
    .when('/networks/new', {
        templateUrl: 'views/new_network.html',
        controller: 'NewNetworkCtrl'
    })
    .when('/datasets', {
        templateUrl: 'views/datasets.html',
        controller: 'DatasetsCtrl'
    })
    .when('/packages', {
        templateUrl: 'views/packages.html',
        controller: 'PackagesCtrl'
    })
    .when('/packages/new', {
        templateUrl: 'views/new_package.html',
        controller: 'NewPackageCtrl'
    })
    .when('/groups', {
        templateUrl: 'views/groups.html',
        controller: 'GroupsCtrl'
    })
    .when('/users', {
        templateUrl: 'views/users.html',
        controller: 'UsersCtrl'
    })
    .otherwise({
        redirectTo: '/status'
    });

    //Replace # with pushstates:
    //$locationProvider.html5Mode(false); //.hashPrefix('!');
}])
.run(function ($http, $cookies, user) {

    /* This is an accepted bug in angularjs.. 1.1.1 has this 'fixed' */
    delete $http.defaults.headers.common['X-Requested-With']

    if ($cookies.login && $cookies.token)
        user.login($cookies.token, $cookies.login)

    })
