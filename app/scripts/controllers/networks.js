'use strict';

fifoApp.controller('NetworksCtrl', function($scope, wiggle, status) {

	$scope.networks = {}

	$scope.show = function() {

		wiggle.ipranges.list(function (ids) {

			ids.length > 0 && status.update('Loading networks', {total: ids.length})

			ids.forEach(function(id) {

				$scope.networks[id] = {tag: id}
				wiggle.ipranges.get({id: id}, function(res) {
					$scope.networks[id] = res
					status.update('Loading networks', {add: 1})
				})

			})
		})
	}

	$scope.show()
});
