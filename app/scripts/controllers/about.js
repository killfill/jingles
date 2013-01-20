'use strict';

fifoApp.controller('AboutCtrl', function($scope, $rootScope, wiggle) {

    wiggle.cloud.get(function res (data) {
        $scope.versions = data.versions
        $scope.adjustMessage = Config.adjustMessage
    })

    /* Twitter button */
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

});
