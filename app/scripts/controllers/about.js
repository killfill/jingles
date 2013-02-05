'use strict';

fifoApp.controller('AboutCtrl', function($scope, $rootScope, wiggle, $http) {

    var opts = {transformRequest:function(a,b){
        delete b()["X-Snarl-Token"];
    }};

    var base = "http://release.project-fifo.net/pkg";
    var branch = "rel";
    $scope.latest = {};

    wiggle.cloud.get(function res (data) {
        $scope.versions = data.versions
        $scope.adjustMessage = Config.adjustMessage
        $http.get('jingles.version').then(function(res){
            $scope.versions.jingles = res.data.trim();
            var this_branch = $scope.versions.jingles.substr(0,3);
            if (this_branch == "dev" || this_branch == "tes") {
                branch = "dev";
            };
            ['sniffle', 'snarl', 'howl', 'wiggle', 'jingles'].forEach(function(E) {
                $http.get(base + '/' + branch + '/' + E + '.version', opts).
                    success(function(res){
                        $scope.latest[E] = res.trim();
                    });
            });
        })
    })

    /* Twitter button */
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

});
