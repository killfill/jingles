'use strict';

angular.module('fifoApp', 
  ['ngRoute', 'ngAnimate', 'ngResource','services.breadcrumbs', 
  'gettext', 'infinite-scroll', 'ngTable', 'angularMoment', 'ngSanitize', 'ngCookies'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Dashboard',
      })
      .when('/machines', {
        templateUrl: 'views/machines.html',
        controller: 'MachinesCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Machines+list',
        name: 'Machines'
      })
      .when('/datasets', {
        templateUrl: 'views/datasets.html',
        controller: 'DatasetsCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Datasets',
        name: 'Datasets'
      })
      .when('/servers', {
        templateUrl: 'views/servers.html',
        controller: 'ServersCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Hypervisors',
        name: 'Servers'
      })
      .when('/configuration', {
        redirectTo: '/configuration/packages'
      })
      .when('/configuration/packages', {
        templateUrl: 'views/packages.html',
        controller: 'PackagesCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Packages',
        name: 'Packages'
      })
      .when('/configuration/networks/new', {
        templateUrl: 'views/network-new.html',
        controller: 'NetworkNewCtrl'
      })
      .when('/configuration/networks', {
        templateUrl: 'views/networks.html',
        controller: 'NetworksCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Networks',
        name: 'Networks'
      })
      .when('/configuration/ip-ranges', {
        templateUrl: 'views/ip-ranges.html',
        controller: 'IpRangesCtrl',
        // helpUrl: 'http://project-fifo.net/display/PF/Ipranges',
        name: 'IP Ranges'
      })
      .when('/configuration/users', {
        templateUrl: 'views/users.html',
        controller: 'UsersCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Users',
        name: 'Users'
      })
      .when('/configuration/groups', {
        templateUrl: 'views/groups.html',
        controller: 'GroupsCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Groups',
        name: 'Groups'
      })
      .when('/configuration/organizations', {
        templateUrl: 'views/organizations.html',
        controller: 'OrganizationsCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Orgs',
        name: 'Organizations'
      })
      .when('/configuration/dtraces', {
        templateUrl: 'views/dtraces.html',
        controller: 'DtracesCtrl',
        name: 'Tracing'
        // helpUrl: 'http://project-fifo.net/display/PF/DTrace'
      })
      .when('/machines/new', {
        templateUrl: 'views/machine-new.html',
        controller: 'MachineNewCtrl'
      })
      .when('/machines/:uuid', {
        templateUrl: 'views/machine.html',
        controller: 'MachineCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Machine+Details',
      })

      .when('/datasets/:uuid', {
        templateUrl: 'views/dataset.html',
        controller: 'DatasetCtrl',
      })
      .when('/servers/:uuid', {
        templateUrl: 'views/server.html',
        controller: 'ServerCtrl'
      })
      .when('/packages/new', {
        templateUrl: 'views/package-new.html',
        controller: 'PackageNewCtrl'
      })
      .when('/packages/:uuid', {
        templateUrl: 'views/package.html',
        controller: 'PackageCtrl'
      })
      .when('/configuration/networks/:uuid', {
        templateUrl: 'views/network.html',
        controller: 'NetworkCtrl'
      })
      .when('/configuration/users/new', {
        templateUrl: 'views/user-new.html',
        controller: 'UserNewCtrl'
      })
      .when('/configuration/users/:uuid', {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Users'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/configuration/groups/new', {
        templateUrl: 'views/group-new.html',
        controller: 'GroupNewCtrl'
      })
      .when('/configuration/groups/:uuid', {
        templateUrl: 'views/group.html',
        controller: 'GroupCtrl'
      })
      .when('/configuration/organizations/new', {
        templateUrl: 'views/organization-new.html',
        controller: 'OrganizationNewCtrl'
      })
      .when('/configuration/organizations/:uuid', {
        templateUrl: 'views/organization.html',
        controller: 'OrganizationCtrl'
      })
      .when('/configuration/dtraces/:uuid', {
        templateUrl: 'views/dtrace.html',
        controller: 'DtraceCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
      })
      .when('/configuration/ip-ranges/new', {
        templateUrl: 'views/ip-range-new.html',
        controller: 'IpRangeNewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    //$locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('!');
  })

.run(function(gettextCatalog, gettext, $window) {

  var lang = window.navigator.userLanguage || window.navigator.language;

  //Some browsers puts 'es-ES' on that vars, so just get the country...
  if (lang.indexOf('-') > -1)
    lang = lang.split('-')[0];

  //default gb flag
  if (Object.keys(gettextCatalog.strings).indexOf(lang) < 0)
    lang = 'gb'

  gettextCatalog.currentLanguage = lang;
  // gettextCatalog.debug = true;

})