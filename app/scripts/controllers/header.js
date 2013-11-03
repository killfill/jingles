'use strict';

angular.module('fifoApp')
  .controller('HeaderCtrl', function ($scope, breadcrumbs, $location, $route, $rootScope, $http, gettextCatalog, auth, howl) {

  	$scope.breadcrumbs = breadcrumbs;

    //Menu higlighting
  	$scope.isActive = function (str) {
  		return $location.path().match(str) !== null;
  	}

    //Login stuff: pass the auth object to the view, kinda handy i.e. for Logout click
    $scope.auth = auth

    //Show if we are connected to howl
    $scope.$watch(
      function()     { return howl.connected() },
      function(bool) { $scope.howlConnected = bool }
    )

    //Help url
  	$rootScope.$on('$routeChangeSuccess', function(event, current){
  		$scope.helpUrl = current.helpUrl || '';

      //Hide the menu dropdown of the mobile version. This should match @grid-float-breakpoint
      if ($(window).width() < 768)
        angular.element('.navbar-toggle').click();

      document.title = current.name ? gettextCatalog.getString(current.name) + ' - FiFo': 'FiFo Cloud';
  	})

  	//Loading spinner
  	$rootScope.$watch(
  		function() {return $http.pendingRequests.length},
  		function() {
  			$scope.loading = $http.pendingRequests.length
  	})

    //Language
    $scope.lang = gettextCatalog.currentLanguage;
    $scope.setLang = function(lang) {
      $scope.lang = gettextCatalog.currentLanguage = lang;
    }
    var langs = Object.keys(gettextCatalog.strings);
    
    //Put the default lang, the others are automatically added
    if (langs.indexOf('gb')<1) langs.push('gb');
    
    $scope.languages = langs.sort();

  });
