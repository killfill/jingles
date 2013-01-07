'use strict';

fifoApp.controller('LoginCtrl', function($scope, wiggle, $route, user) {

	$scope.login = function() {

		wiggle.users.login({login: $scope.username}, {password: $scope.password}, 
			function success(data){

				user.login(data.token, $scope.username)
				$scope.username = $scope.password = null

				//reload the current view
				$route.reload()

			}, 
			function error(){
				$scope.loginError = "Invalid user"
				alert('Login failed. Try again')
			})

	}

	$scope.logout = function() {
		$scope.username = $scope.password = null;
		user.logout();
	}

});