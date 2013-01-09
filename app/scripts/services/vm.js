'use strict';

fifoApp.factory('vmService', function($rootScope, wiggle, status, modal) {

    return {
        executeAction: function(action, uuid, alias, cb) {
            var name = alias || uuid;

            if (action!='delete') {
                status.update('Will ' + action + ' ' + name, {info: true})
                cb && cb(action, uuid)
                return wiggle.vms.put({id: uuid}, {action: action})
            }

            modal.confirm({
                btnClass: 'btn-danger', 
                btnText: 'Delete', 
                header: 'Confirm VM Deletion',
                body: '<p><font color="red">Warning!</font> you are about to delete VM <b id="delete-uuid">' + uuid + " "+ (alias? '(' + alias + ')': '') + "</b> Are you 100% sure you really want to do this?</p><p>Clicking on Destroy here will mean this VM is gone forever!</p>"
            }, function() {
                status.update('Will delete ' + name, {info: true})
                wiggle.vms.delete({id: uuid})
                cb && cb(action, uuid)
            })

        },

        updateCustomFields: function(vm) {
            if (!vm.config) {
                vm._state_label = 'important'
                return vm;
            }

            vm._name = vm.config.alias || vm.uuid.split('-')[0]
            vm._ips = (vm.config.networks || []).map(function(e) { return e.ip}).join(", ");
            vm._cpu = vm.config.vcpu || vm.config.cpu_shares;
            vm._cpu_tooltip = vm.config.vcpu 
                ? vm.config.vcpu + ' CPU'
                : vm.config.cpu_cap ? 'Shares: ' + vm.config.cpu_shares + '</br>Cap:'+ vm.config.cpu_cap:  'Shares: '+vm.config.cpu_shares;
            vm._state_label = vm.state=='running'
                ? 'success'
                : vm.state == 'stopped'
                    ? 'warning'
                    : 'important'

            return vm;
        }
    }
});