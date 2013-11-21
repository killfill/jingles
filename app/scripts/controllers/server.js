'use strict';

angular.module('fifoApp')
  .controller('ServerCtrl', function ($scope, $routeParams, $location, utils, wiggle, vmService, status) {

    var uuid = $routeParams.uuid
    $scope.characteristics = []

    var size = 30;
    var usr = [];
    var sys = [];
    for (var i = 0; i <= size; i++) {
        usr.push(0);
        sys.push(0);
    }
    var cpu_chart = new MetricsGraph("cpuusage", {
        unit:"%",
        size: 60,
        type: "percentage",
        min: 0,
        max: 100,
        series: [
            {options: {
                color: "#FFA455",
                label: "system"}},
            {options: {
                color: "#69B3E4",
                label: "user"}},
            {options: {
                color: "#B6E7AC",
                label: "idle"}},
        ]});


    howl.join(uuid + '-metrics');

    $scope.$on('$destroy', function() {
        howl.leave(uuid + '-metrics');
    });

    $scope.$on('mpstat', function(e, msg) {
        var data = msg.message.data;
        var usrv = 0, sysv = 0, idlv = 0, cnt = 0;
        msg.message.data.forEach(function(o) {
            usrv = usrv + o.user;
            sysv = sysv + o.kernel;
            idlv = idlv + o.idle;
            cnt = cnt + 1
        });
        cpu_chart.add([sysv/cnt, usrv/cnt, idlv/cnt])
    });

    $scope.add = function() {
        status.prompt('Enter the key of the new characteristic:', function(key) {
            $scope.characteristics.push({
                name: key,
                value: ''
            })
            $scope.$apply()
        })
    }

    $scope.del = function(key, idx) {
        wiggle.hypervisors.delete({id: uuid, controller: 'characteristics', controller_id: key}, function() {
            $scope.characteristics.splice(idx, 1);
        })
    }

    $scope.save = function() {
        $scope.characteristics.forEach(function(i) {
            var data = {}
            data[i.name] = i.value

            wiggle.hypervisors.put(
                {id: uuid, controller: 'characteristics'},
                data
            )
        })
    }

    $scope.$watch('characteristics', function(newArr, oldArr) {

        if (oldArr.length<1) return

        arrayDiff(newArr, oldArr).forEach(function(changed) {
            var hash = {}
            hash[changed.name] = utils.deserialize(changed.value)
            wiggle.hypervisors.put({id: uuid, controller: 'characteristics'}, hash)
        })

    }, true)

    //Return the difference between 2 arrays
    var arrayDiff = function(newArr, oldArr) {
        var idx = 0;
        return newArr.filter(function(i){

            var newVal = newArr[idx],
            oldVal = oldArr[idx]

            idx++
            if (!oldVal) return true

            return newVal.value != oldVal.value
        })
    }

    var init = function() {
        wiggle.hypervisors.get({id: uuid}, function(res) {
            $scope.hyper = res;
            if (res.characteristics) {
                Object.keys(res.characteristics).forEach(function(k) {
                    $scope.characteristics.push({name: k, value: res.characteristics[k]})
                })
            }

        });
    }
    
    // $scope.$on('user_login', init)
    // if (user.logged()) init()
    init();
    preventHrefTab();
  });
