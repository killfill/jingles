'use strict';

fifoApp.factory('status', function($rootScope) {

    var status = {};

    var updateText = function(status) {
        var txt = []

        $rootScope.status = []
        Object.keys(status).forEach(function(k) {
            var st = status[k],
            msg = {
                percent: (100 * st.current / st.total).toFixed(0),
                current: st.current,
                total: st.total,
                name: k,
                show_progress: typeof st.current == 'number'
            }
            $rootScope.status.push(msg)
        })

    }

    return {
        /* params: {total: int, add: int} */
        update: function(type, params) {

            //when total comes, start from scratch
            if (params && params.total)
                params.current = 0;

            if (params && params.add)
                status[type].current += params.add;
            else
                status[type] = params

            /* delete msg if the work is done */
            if (status[type].current && status[type].total && status[type].current >= status[type].total)
                delete status[type]

            if (params.info)
                setTimeout(function() {
                    delete status[type]
                    updateText(status)
                    $rootScope.$digest();
                }, typeof info === 'number'? params.info: 3000)

            updateText(status)

        }
    };
});
