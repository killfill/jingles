'use strict';

fifoApp.controller('AboutCtrl', function($scope, $rootScope, wiggle) {

    wiggle.cloud.get(function res (data) {
        $scope.versions = data.versions
        $scope.adjustMessage = Config.adjustMessage
    })

});
