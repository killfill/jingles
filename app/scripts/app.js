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
        controller: 'NetworkNewCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Networks'
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
        helpUrl: 'http://project-fifo.net/display/PF/Ipranges',
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
        name: 'Tracing',
        helpUrl: 'http://project-fifo.net/display/PF/DTrace'
      })
      .when('/machines/new', {
        templateUrl: 'views/machine-new.html',
        controller: 'MachineNewCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Machine+Details',
      })
      .when('/machines/:uuid', {
        templateUrl: 'views/machine.html',
        controller: 'MachineCtrl',
        helpUrl: 'http://project-fifo.net/display/PF/Machine+Details',
      })
      .when('/datasets/:uuid', {
        templateUrl: 'views/dataset.html',
        helpUrl: 'http://project-fifo.net/display/PF/Datasets',
        controller: 'DatasetCtrl',
      })
      .when('/servers/:uuid', {
        templateUrl: 'views/server.html',
        helpUrl: 'http://project-fifo.net/display/PF/Hypervisors',
        controller: 'ServerCtrl'
      })
      .when('/configuration/packages/new', {
        templateUrl: 'views/package-new.html',
        helpUrl: 'http://project-fifo.net/display/PF/Packages',
        controller: 'PackageNewCtrl'
      })
      .when('/configuration/packages/:uuid', {
        templateUrl: 'views/package.html',
        helpUrl: 'http://project-fifo.net/display/PF/Packages',
        controller: 'PackageCtrl'
      })
      .when('/configuration/networks/:uuid', {
        templateUrl: 'views/network.html',
        helpUrl: 'http://project-fifo.net/display/PF/Networks',
        controller: 'NetworkCtrl'
      })
      .when('/configuration/users/new', {
        templateUrl: 'views/user-new.html',
        helpUrl: 'http://project-fifo.net/display/PF/Users',
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
        helpUrl: 'http://project-fifo.net/display/PF/Groups',
        controller: 'GroupNewCtrl'
      })
      .when('/configuration/groups/:uuid', {
        templateUrl: 'views/group.html',
        helpUrl: 'http://project-fifo.net/display/PF/Groups',
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
      .when('/configuration/dtraces/new', {
        templateUrl: 'views/dtrace-new.html',
        helpUrl: 'http://project-fifo.net/display/PF/DTrace',
        controller: 'DtraceNewCtrl'
      })
      .when('/configuration/dtraces/:uuid', {
        templateUrl: 'views/dtrace.html',
        helpUrl: 'http://project-fifo.net/display/PF/DTrace',
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
      .when('/visualizations/graph', {
        templateUrl: 'views/vis-graph.html',
        controller: 'VisGraphCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    //$locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('!');
  })

.run(function($rootScope, gettextCatalog, gettext, $window) {

  var lang = window.navigator.userLanguage || window.navigator.language;

  //Some browsers puts 'es-ES' on that vars, so just get the country...
  if (lang.indexOf('-') > -1)
    lang = lang.split('-')[0];

  //default gb flag
  if (Object.keys(gettextCatalog.strings).indexOf(lang) < 0)
    lang = 'gb'

  gettextCatalog.currentLanguage = lang;
  // gettextCatalog.debug = true;


  //Let bootstrap markup do its job.
  var preventHrefs = function() {
      //No idea why doesnt .preventDefault work on the functoin that has bootstrap.js.
      //Had to put it in here, to prevent the anchor to follow its href, on tabs and collapse's
      //Worked without this on jingles v1
      function prevent(e) {e.preventDefault()}
      $('[data-toggle=tab]').on('click', prevent);
      $('[data-toggle=collapse]').on('click', prevent);
  }

  $rootScope.$on('$routeChangeSuccess', function(ev, curr, prev) {
    //Adding preventHrefs at the end of the processing queue, so the translate directive has time to replace the element before this.
    //There should be a more elegant way to fix this. Ref: https://github.com/rubenv/angular-gettext/issues/24
    setTimeout(preventHrefs, 0)
  })

})