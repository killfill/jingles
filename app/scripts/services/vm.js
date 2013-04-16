'use strict';

fifoApp.factory('vmService', function(wiggle, status, modal) {

    var padLeft = function(nr, n, str){
        return Array(n-String(nr).length+1).join(str||'0')+nr;
    }

    /* After implementing multi-lang, this should not exist anymore.. :P */
    var actionDescrition = {
        'start': 'Starting',
        'stop': 'Stopping',
        'reboot': 'Rebooting'
    }

    return {

        /* So far action can be: start/stop/reboot/delete. More info: http://project-fifo.net/display/PF/API */
        executeAction: function(action, uuid, alias, force, cb) {
            var name = alias || uuid;

            if (action!='delete') {
                var b = {action: action};
                if (force && (action == "stop" || action == "reboot"))
                    b.force = true;
                return wiggle.vms.put({id: uuid}, b,
                                      function success(r, headers) {
                                          if (!headers)
                                              return status.error('An error 500 has occur. :(');

                                          status.info(actionDescrition[action] + ' machine ' + name)
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
                wiggle.vms.delete({id: uuid},
                                  function success(data, h) {
                                      status.info('Deleting machine '  + name)
                                      cb && cb(action, uuid)
                                  }
                                 )

            })

        },

        updateCustomFields: function(vm) {

            vm._name = (vm.config && vm.config.alias) || vm.uuid && vm.uuid.split('-')[0]

            switch (vm.state) {
            case 'failed-get_ips':
                vm.state_description = "No IP address for the machine could be obtained.";
                vm.state = 'failed';
                vm._state_label = 'important';
                break;
            case 'failed-get_dataset':
                vm.state_description = "The dataset could not be retrieved.";
                vm.state = 'failed';
                vm._state_label = 'important';
                break;
            case 'failed-get_package':
                vm.state_description = "The package could not be retrieved.";
                vm.state = 'failed';
                vm._state_label = 'important';
                break;
            case 'failed-get_server':
                vm.state_description = "No suitable server to deploy the VM on could be found.";
                vm.state = 'failed';
                vm._state_label = 'important';
                break;
            case 'running':
                vm.state_description = "The VM is running."
                vm._state_label = 'success';
                break;
            case 'stopped':
                vm.state_description = "The VM is stopped."
                break;
            case 'creating':
                vm.state_description = "The VM is currently bing provisioned on the hypervisor."
                break;
            case 'installing_dataset':
                vm.state_description = "The dataset for the VM is currently being installed on the hypervisor."
                vm.state = 'creating';
                break;
            case 'shutting_down':
                vm.state_description = "The VM is currently shutting down."
                vm.state = 'shutting down';
                break;
            case 'booting':
                vm.state_description = "The VM is currently booting."
                break;
            default:
                vm.state_description = vm.state;
                vm._state_label = 'warning';
                break;
            };

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
                    return e && e.split('.').map(function(i) {return padLeft(i, 3)}).join('.');
                }).join(", ")
            : vm.config.networks[0].ip;

            return vm;
        }
    }
});
