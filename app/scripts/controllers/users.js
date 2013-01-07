'use strict';

fifoApp.controller('UsersCtrl', function($scope, wiggle, status) {

	$scope.users = {}

	$scope.show = function() {

		wiggle.users.list(function (ids) {

			ids.length > 0 && status.update('Loading users', {total: ids.length})

			ids.forEach(function(id) {

				$scope.users[id] = {name: id}
				wiggle.users.get({id: id}, function(res) {
					$scope.users[id] = addFields(res)
					status.update('Loading users', {add: 1})
				})

			})
		})
	}

	$scope.show()

	var addFields = function(u) {
		u._perm = u.permissions.map(function(P) {
			return P.join("->");
		}).join(", ")
		return u;
	}

});
