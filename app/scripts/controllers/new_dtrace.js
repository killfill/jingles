'use strict';
var x;
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

            if ((item['value'] == undefined) ||
                (item['name'] == undefined) ||
                !item['name'].match(/^\w+$/)) {
                valid = false;
            };

        })
        return valid;
    };

    var finalize_vars = function(vars) {
        return vars.map(function(v) {
            if (typeof v.value != "string") {
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

    // reserved placeholders
    var reserved = ["filter"];

    /*
     * Check which variables are used in the script and add the new ones to the
     * variable list.
     */
    function add_missing_vars(text, old_vars) {
        var found = text.match(/\$\w+\$/g);
        // we can return early when nothing was found.
        if (!found)
            return old_vars;

        // we need to strip the results from $'s and filter out reserved
        // variables like filter.
        var vars = found.map(function(e){
            return e.replace(/\$/g,'')
        }).filter(function(e) {
            return reserved.indexOf(e) == -1
        });

        // We add all those not already in the list, this is a bit tricky
        // since the list isn't a k/v pair but a array of objects.
        vars.forEach(function(v) {
            var existing = false
            old_vars.forEach(function(v1){
                existing = existing || (v1["name"] == v)
            });
            if (!existing) {
                old_vars.push({name: v})
            };
        });

        // we filter out variables that do not apear in the code nor are set.
        // this prevents spamming when a variable is changed.
        return old_vars.filter(function(e) {
            var keep = vars.indexOf(e.name) >= 0 ||
                e.value != undefined;
            return keep;
        });
    };

    $scope.script_change = function() {
        $scope.variables = add_missing_vars($scope.script, $scope.variables);
    };
    $scope.create_dtrace = function() {
        var vars = finalize_vars($scope.variables);

        if (!validate_vars(vars)) {
            status.error('Some variables are not valid. Please fix them');
            return;
        }
        var config = {};
        vars.forEach(function(v){
            if (v['name'] != undefined && v['value'] != undefined )
                config[v['name']] = v['value'];
        });
        console.log(vars, config);
        var dtrace = new wiggle.dtrace({
            name: $scope.name,
            script: $scope.script,
            config: config
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
