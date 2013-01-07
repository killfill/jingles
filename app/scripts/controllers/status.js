'use strict';

fifoApp.controller('StatusCtrl', function($scope, $rootScope, wiggle) {


	$scope.msgTrClass = function(type) {
		return type == 'critical' ? 'error': type;
	}

	$scope.show = function() {

		wiggle.cloud.get(function res (data) {
			$scope.metrics = data.metrics
			$scope.versions = data.versions
			$scope.total_memory = data.metrics['provisioned-memory'] + data.metrics['free-memory']
			$scope.messages = Config.evaluate_cloud(data.metrics).concat(data.warnings)
			
			var ok = true;
			$scope.messages.forEach(function (msg) {
				if (msg.type != 'info') ok = false;
			})
			$scope.cloud_status = ok ? 'images/healthy-cluster.png' : 'images/unhealthy-cluster.png'
			$scope.cloud_resume = ok ? 'Your cloud is fine!'        : 'Your cloud needs some attention!'

		})

	}

	$rootScope.loggedUser && $scope.show()

});
