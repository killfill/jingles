'use strict';


fifoApp.controller('HypervisorCtrl', function($scope, $routeParams, $location, wiggle, vmService, modal, status) {
    $scope.setTitle('Hypervisor details')

    var uuid = $routeParams.uuid
    $scope.characteristics = []

    wiggle.hypervisors.get({id: uuid}, function(res) {
        $scope.hyper = res;
        if (res.characteristics) {
            Object.keys(res.characteristics).forEach(function(k) {
                $scope.characteristics.push({name: k, value: res.characteristics[k]})
            })
        }

    });

    var size = 30;
    var usr = [];
    var sys = [];
    for (var i = 0; i <= size; i++) {
        usr.push(0);
        sys.push(0);
    }

    var make_data = function (usr, sys) {
        var sysH = sys.map(function(v, i) {
            return {x: i, y: v}
        });
        var usrH = usr.map(function(v, i) {
            return {x: i, y: v + sys[i]}
        });
        return {
            "xScale": "linear",
            "yMin": 0,
            "yMax": 100,
            "xMin": 0,
            "xMax": 30,
            "yScale": "linear",
            "type": "line",
            "main":[
                {"className": ".sys",
                 "data": sysH},
                {"className": ".usr",
                 "data": usrH}
            ]};
    };
    var chart = new xChart('line', make_data(usr, sys), '#cpuusage');
    var last_usr = 0;
    var last_sys = 0;
    var last_idl = 0;


    howl.join(uuid + '-metrics');

    $scope.$on('$destroy', function() {
        howl.leave(uuid + '-metrics');
    });

    $scope.$on('mpstat', function(e, msg) {
        var data = msg.message.data;
        var usrv = 0, sysv = 0, idlv = 0, cnt = 0;
        msg.message.data.forEach(function(o) {
            usrv = usrv + o.usr;
            sysv = sysv + o.sys;
            idlv = idlv + o.idl;
            cnt = cnt + 1
        });
        usrv = usrv/cnt;
        sysv = sysv/cnt;
        idlv = idlv/cnt;
        if (last_usr || last_sys || last_idl) {
            var usrd = usrv - last_usr;
            var sysd = sysv - last_sys;
            var idld = idlv - last_idl;
            var t = usrd + sysd + idld;
            var n = new Date().getTime();
            usr.shift();
            usr.push(100*usrd/t);
            sys.shift();
            sys.push(100*sysd/t);
//            console.log(make_data(usr, sys))
            chart.setData(make_data(usr, sys));
        }
        last_sys = sysv;
        last_usr = usrv;
        last_idl = idlv;
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
            hash[changed.name] = deserialize(changed.value)
            wiggle.hypervisors.put({id: uuid, controller: 'characteristics'}, hash)
        })

    }, true)

    var deserialize = function(value) {
        var ret = value;

        /* If it has commas, its an array of string */
        if (value.indexOf(',')>-1)
            ret = value.split(',')

        /* See if its a number */
        if ( (value - 0) == value && value.length > 0)
            ret = parseFloat(value, 10)

        return ret
    }

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

})
