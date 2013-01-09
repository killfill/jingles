'use strict';

var fifoApp = angular.module('fifoApp', ['ngResource', 'ngCookies'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        console.log($routeProvider);
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
            .when('/datasets', {
                templateUrl: 'views/datasets.html',
                controller: 'DatasetsCtrl'
            })
            .when('/packages', {
                templateUrl: 'views/packages.html',
                controller: 'PackagesCtrl'
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

/**
 * bootstrap directives from datasets.at
 */
fifoApp
    .directive('navTabs', function() {
        return {
            restrict: 'E',
            transclude: true,
            template:
            '<ul class="nav nav-tabs" data-spy="affix" ng-transclude>' +
                '</ul>',
            replace: true
        };
    })
    .directive('navTab', ['$location', function($location) {
        var match = function(href, url) {
            var href_a = href.split('/');
            var url_a = url.split('/');
            var i;

            for (i in href_a) {
                if (href_a[i] !== url_a[i]) {
                    return false;
                }
            }

            return true;
        }

        return {
            restrict: 'E',
            transclude: true,
            scope: {
                'href': '@',
                'icon': '@'
            },
            link: function (scope) {
                scope.location = function (href) {
                    return match(href.substr(1), $location.url());
                };
            },
            template:
            '<li ng-class="{active: location(href)}">' +
                '<a href="{{href}}" class="glyphicons {{icon}}" ng-transclude><i></i></a>' +
                '</li>',
            replace: true
        };
    }]);
