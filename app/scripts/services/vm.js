'use strict';

fifoApp.factory('vmService', function($rootScope, wiggle, status, modal) {

    var padLeft = function(nr, n, str){
        return Array(n-String(nr).length+1).join(str||'0')+nr;
    }

    return {

        /* So far action can be: start/stop/reboot/delete. More info: http://project-fifo.net/display/PF/API */
        executeAction: function(action, uuid, alias, cb) {
            var name = alias || uuid;

            if (action!='delete') {
                status.info('Will ' + action + ' ' + name)
                return wiggle.vms.put({id: uuid}, {action: action},
                    function success(r, headers) {
                        if (!headers)
                            return alert('An error 500 has occur. :(');

                        cb && cb(action, uuid)
                    }
                )
            }

            modal.confirm({
                btnClass: 'btn-danger',
                btnText: 'Delete',
                header: 'Confirm VM Deletion',
                body: '<p><font color="red">Warning!</font> you are about to delete VM <b id="delete-uuid">' + uuid + " "+ (alias? '(' + alias + ')': '') + "</b> Are you 100% sure you really want to do this?</p><p>Clicking on Delete here will mean this VM is gone forever!</p>"
            }, function() {
                status.info('Will delete ' + name)
                wiggle.vms.delete({id: uuid},
                    function success(data, h) {
                        cb && cb(action, uuid)
                    }
                )

            })

        },

        updateCustomFields: function(vm) {

            vm._name = (vm.config && vm.config.alias) || vm.uuid && vm.uuid.split('-')[0]
            vm._state_label = vm.state=='running'
                ? 'success'
                : vm.state == 'stopped'
                    ? 'warning'
                    : 'important'

            if (!vm.config)
                return vm;

            /* When the vm is not fully created yet, just put the current time.. :P
               (i.e. ater the update event on vm creation*/
            if (!vm.config.created_at)
                vm.config.created_at = new Date()

            vm._name = vm.config.alias || vm.uuid.split('-')[0]

            //Get the ips to show
            var ips = (vm.config.networks || [])
                .filter(function(i) {return vm.config.networks.length<2 || i.primary=='true'})
                .map(function(e) { return e.ip})

                //Take the undefined elements out of the array (i.e. when there is no ip attribute)
                .filter(function(i) {return i;});

            //If there is nothing to show, just show the one of the first network
            vm._ips = ips.length > 0 ? ips.join(", ") : vm.config.networks[0].ip;

            vm._cpu = vm.config.vcpu || vm.config.cpu_shares;
            vm._cpu_tooltip = vm.config.vcpu
                ? vm.config.vcpu + ' CPU'
                : vm.config.cpu_cap ? 'Shares: ' + vm.config.cpu_shares + '</br>Cap:'+ vm.config.cpu_cap:  'Shares: '+vm.config.cpu_shares;

            //Used for ordering in the vm list:
            vm._ips_normalized = ips.length > 0 ?
                ips.map(function(e) {
                    return e && e.ip && e.ip.split('.').map(function(i) {return padLeft(i, 3)}).join('.');
                }).join(", ")
                : vm.config.networks[0].ip;


            return vm;
        }
    }
});
