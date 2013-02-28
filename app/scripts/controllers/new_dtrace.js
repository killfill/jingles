'use strict';

fifoApp.controller('NewDtraceCtrl', function($scope, $location, wiggle, status) {

    $scope.add_var = function() {
        $scope.variables.push({})
    }

    $scope.rm_var = function(idx) {
        $scope.variables.splice(idx, 1);
    }

    var validate_vars = function(vars) {
        var valid = true;
        vars.forEach(function(item) {

            /* If none of the fields are present, just ignore it. */
            var nonePresent = !item['value'] && !item['name'];
            if (nonePresent) {
                return;
            };

            if ((item['value'] == undefined) || (item['name'] == undefined) || !item['name'].match(/^\w+$/)) {
                console.log(item)
                valid = false;
            };

        })
        return valid;
    };

    var finalize_vars = function(vars) {
        return vars.map(function(v) {
            if (typeof v != "string") {
                return v;
            } else if (v.value.match(/^\d+$/)) {
                v.value = parseInt(v.value);
            } else if (v.value == "true") {
                v.value = true;
            } else if (v.value == "false") {
                v.value = false;
            } else if (v.value == "null") {
                v.value = null;
            };
            return v;
        });
    }

    function add_mising_vars(text, old_vars) {
        var found = text.match(/\$\w+\$/g);
        if (!found)
            return old_vars;
        var vars = found.map(function(e){return e.replace(/\$/g,'')});
        vars.forEach(function(v) {
            var existing = false
            old_vars.forEach(function(v1){
                existing = existing || (v1["name"] == v)
            });
            if (!existing) {
                old_vars.push({name: v})
            };
        });
        return old_vars;
    };
    $scope.script_change = function() {
        add_mising_vars($scope.script, $scope.variables);
    };
    $scope.create_dtrace = function() {
        var vars = finalize_vars($scope.variables);

        if (!validate_vars(vars)) {
            status.error('Some variables are not valid. Please fix them');
            return;
        }


        var dtrace = new wiggle.dtrace({
            name: $scope.name,
            script: $scope.script,
            config: vars.filter(function(item) {
                return item['name'] && item['value'];
            })
        });

        dtrace.$create({},
                       function success(data, headers) {
                           $location.path('/dtrace');
                       },
                       function error(data) {
                           console.error('Create Dtrace error:', data);
                           status.error('There was an error creating your dtrace. See the javascript console.');
                       }
                      );
    }


    $scope.init = function() {
        $scope.variables = [];
    }

    $scope.init()
})
