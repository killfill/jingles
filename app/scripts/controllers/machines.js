'use strict';

angular.module('fifoApp')
.controller('MachinesCtrl', function ($scope, $http, $filter, wiggle, status, vmService, $q, auth, ngTableParams) {

    //To hide colums based on permission on the view
    $scope.auth = auth;

    $scope.infinitScroll = function() {
      if ($scope.tableParams.count() >= $scope.vmsIds.length)
        return;
      $scope.tableParams.count($scope.tableParams.count + 5);
    }

    $scope.start = function(vm) {
      vmService.executeAction('start', vm.uuid, vm.config &&  vm.config.alias)
    }

    $scope.connect = function(vm) {
      if (vm.config.type == 'kvm')
        window.open('vnc.html?uuid=' + vm.uuid);
      else
        window.open('console.html?uuid=' + vm.uuid);
    }

    var filterData = function() {
      var p = $scope.tableParams;

      var dataArray = Object.keys($scope.vms).map(function(k) { return $scope.vms[k] })
      var data = $scope.searchQuery ? $filter('filter')(dataArray, $scope.searchQuery) : dataArray;

      data = p.sorting()? $filter('orderBy')(data, p.orderBy()) : data

      $scope.vmsFiltered = data.slice((p.page() - 1) * p.count(), p.page() * p.count());
    }

    var listenEvents = function() {

      $scope.$on('state', function(e, msg) {
          var vm = $scope.vms[msg.channel];
          if (!vm) return;
          var failed = function(reason) {
              status.error("The creation of the VM " + vm.config.alias +
                           "(" + vm.uuid + ") failed. <br/>" + reason);
          }
          vm.state = msg.message.data;
          vmService.updateCustomFields(vm);
          if (vm.state == 'failed') {
              failed(vm.state_description);
          };
          $scope.$apply()
      })

      $scope.$on('update', function(e, msg) {

        requestsPromise.then(function() {
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
          if (vm.owner)
              wiggle.orgs.get({id: vm.config.package}, function(org) {
                  vm._owner = org
              })

          // $scope.$apply()
        })
      })

      $scope.$on('delete', function(e, msg) {

        //Wait for the list to exists, before deleting an element of it.
        requestsPromise.then(function() {
          delete $scope.vms[msg.channel]
          filterData()
        })
      })
    }

    var startRequests = function() {

      var defered = $q.defer();

      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 25,
        total: 0, //0=disable
        sorting: {
          'config.alias': 'desc' //Could save this in the user metadata.. :P
        },
        counts: [] ,//[] = disable ngTable pagination buttons
      }, {
        getData: function($defer, params) {
          filterData()
          $defer.resolve($scope.vmsFiltered)
        }
      })

      //When something on the table changes, i.e. infinit scroll detected.
      $scope.$watch('tableParams', function() {
        filterData()
      }, true);

      $scope.$watch('searchQuery', function(val) {
        filterData();

        if (typeof val != 'undefined')
          auth.currentUser().mdata_set({vm_searchQuery: val})
      })

      $scope.vmsIds = []
      $scope.vmsFiltered = []
      $scope.vms = {}

      wiggle.vms.list(function (ids) {

        defered.notify('VM ids loaded.')
        $scope.vmsIds = ids;

        //Count the responses, to we can show the first vm's: probably not workth, becouse datasets and packages request are enqueued at the last... and we need them...
        var count = 0;

        ids.forEach(function(id) {

          wiggle.vms.get({id: id}, function success(res) {
            $scope.vms[id] =  vmService.updateCustomFields(res)

            count += 1
            //Fire up showing the VM's when all data is loaded or the first bulk is¡ ready!
            if (Object.keys($scope.vms).length == $scope.vmsIds.length || count  == $scope.tableParams.count - 1) {
              defered.resolve()
            }
          })

        })

      })

      listenEvents();
      return defered.promise

  }

  var requestsPromise = startRequests()
  
  requestsPromise.then(function() {
    $scope.searchQuery = auth.currentUser().mdata('vm_searchQuery');
    filterData()
    $scope.infinitScroll()
  });

  });
