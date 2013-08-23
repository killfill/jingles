'use strict';

fifoApp.controller('NewPackageCtrl', function($scope, $location, wiggle, status) {
    $scope.setTitle('New package')

    $scope.add_rule = function() {
        $scope.rules.push({})
    }

    $scope.rm_rule = function(idx) {
        $scope.rules.splice(idx, 1);
    }

    var validateRequirements = function() {
        var valid = true;

        $scope.rules.forEach(function(item) {

            /* If none of the fields are present, just ignore it. */
            var nonePresent = !item['attribute'] && !item['condition'] && !item['weight'] && !item['value']
            if (nonePresent) {
                item.error = false
                return;
            }

            if (!item['attribute'] || !item['condition'] || !item['weight'] || !item['value']) {
                valid = false;
                item.error = true;
            }
            else
                item.error = false

        })
        return valid;

    }

    $scope.create_package = function() {

        if (!validateRequirements()) {
            status.error('Some rules are not valid. Please fix them');
            return;
        }


        var pkg = new wiggle.packages({
            name: $scope.name,
            quota: parseInt($scope.quota),
            ram: parseInt($scope.ram),
            cpu_cap: parseInt($scope.cpu_cap),
            requirements: $scope.rules.filter(function(item) {
                return item['attribute'] && item['condition'] && item['weight'] && item['value'];
            }).map(function(item) {
                item['value'] = parseInt(item['value']);
                if (item['weight'].match("^[0-9]+$")) {
                    item['weight'] = parseInt(item['weight']);
                }
                return item;
            })
        })

        pkg.$create({}, function success(data, headers) {
            $location.path('/packages');
        }, function error(data) {
            console.error('Create Package error:', data);
            status.error('There was an error creating your package. See the javascript console.');
        });
    }


    $scope.init = function() {
        $scope.rules = [{}];

        $scope.availableOptions = {
            attribute: [ 'resource.free-memory', 'resource.l1hits', 'resource.l1miss', 'resource.l1size',
                         'resource.provisioned-memory', 'resource.total-memory']
        }
    }

    $scope.init()
})
