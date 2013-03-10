'use strict';

fifoApp.controller('Virtual-MachinesCtrl', function($scope, user, wiggle, status, modal, howl, vmService) {
    $scope.setTitle('Virtual Machines')

    $scope.vms = {}

    $scope.action = function(action, vm) {
        vmService.executeAction(action, vm.uuid, vm.config && vm.config.alias, function() {
            if (action=='delete')
                $location.path('/virtual-machines')
        })
    }
    $scope.vnc = function(vm) {
        window.open("vnc.html?uuid=" + vm.uuid);
    };

    $scope.console = function(vm) {
        window.open("console.html?uuid=" + vm.uuid);
    };

    $scope.show = function() {

        var allColumns = [
            {name: 'Name',      visible: true,  field: 'config.alias'},
            {name: 'Description',visible: false, field: 'metadata.jingles.description'},
            {name: 'Dataset',   visible: true,  field: 'config._dataset.name'},
            {name: 'IPs',       visible: true,  field: '_ips_normalized'},
            {name: 'Package',   visible: true,  field: 'package'},
            {name: 'Memory',    visible: true,  field: 'config.ram'},
            {name: 'CPU',       visible: false, field: '_cpu'},
            {name: 'Hypervisor',visible: false, field: 'hypervisor'},
            {name: 'Age',       visible: true,  field: 'config.created_at'},
            {name: 'State',     visible: true,  field: 'state'},
            {name: 'Actions',   visible: true}
        ]
        var customColumns = user.mdata('vm_fields')

        if (!customColumns)
            $scope.columns = allColumns
        else
            $scope.columns = customColumns.length != allColumns.length
                                ? allColumns
                                : customColumns

        wiggle.vms.list(function (ids) {
            ids.length > 0 && status.update('Loading machines', {total: ids.length})

            ids.forEach(function(id) {

                $scope.vms[id] = {uuid: id, state: 'loading'}
                wiggle.vms.get({id: id}, function(res) {

                    status.update('Loading machines', {add: 1})
                    //If the vm is deleting, delete them from the list..
                    if (res.state == 'deleting')
                        delete $scope.vms[id];
                    else
                        $scope.vms[id] = vmService.updateCustomFields(res);
                })
            })
        })

        $scope.$on('state', function(e, msg) {
            var vm = $scope.vms[msg.channel];
            if (!vm) return;

            vm.state = msg.message.data
            vmService.updateCustomFields(vm)
            $scope.$apply()
        })

        $scope.$on('update', function(e, msg) {
            var vm = $scope.vms[msg.channel];

            vm.config = msg.message.data.config;
            vmService.updateCustomFields(vm);

            /* Get the extra data */
            wiggle.datasets.get({id: vm.config.dataset}, function(ds) {
                vm.config._dataset = ds;
            })
            wiggle.packages.get({id: vm.config.package}, function(pack) {
                vm._package = pack
            })
            $scope.$apply()
        })

        $scope.$on('delete', function(e, msg) {
            delete $scope.vms[msg.channel]
            $scope.$apply()
        })
    }

    $scope.show()

    /* Ordering stuff: If any other table need something like this, probably a directive would be greate. */
    $scope.orderField = user.mdata('vm_sort_field') || 'config.alias';
    $scope.order = function(field, evt) {
        //var el = angular.element(evt.currentTarget)

        /* Change to asc or desc */
        if (field == $scope.orderField && $scope.orderField[0] != '-')
            $scope.orderField = '-' + field
        else
            $scope.orderField = field;

        user.mdata_set({vm_sort_field: $scope.orderField});
    };

    $scope.orderStyle = function(field) {

        if ($scope.orderField.indexOf(field) < 0)
            return;

        if ($scope.orderField[0] == '-')
            return 'clickable sorted-down'
        else
            return 'clickable sorted-up'
    };

    $scope.showPopupContent = function() {
        var content = document.getElementById('popupContent')
        if (!content) return;
        content.className = ''
        return content
    };

    $scope.showHideColumn = function() {
        user.mdata_set({vm_fields: $scope.columns});
    };

});
