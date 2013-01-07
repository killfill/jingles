'use strict';

fifoApp.controller('PackagesCtrl', function($scope, wiggle, status) {

	$scope.packages = {}

	$scope.show = function() {

		wiggle.packages.list(function (ids) {

			ids.length > 0 && status.update('Loading packages', {total: ids.length})

			ids.forEach(function(id) {

				$scope.packages[id] = {name: id}
				wiggle.packages.get({id: id}, function(res) {
					$scope.packages[id] = res
					status.update('Loading packages', {add: 1})
				})

			})
		})
	}

	$scope.show()
});
