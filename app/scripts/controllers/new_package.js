'use strict';

fifoApp.controller('NewPackageCtrl', function($scope, $location, wiggle, status, utils) {
    $scope.setTitle('New package')

    $scope.add_rule = function() {
        $scope.rules.push({})
    }

    $scope.rm_rule = function(idx) {
        $scope.rules.splice(idx, 1);
    }

    var validateRules = function(rules) {
        var valid = true;

        rules.forEach(function(item) {

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

        if (!validateRules($scope.rules)) {
            status.error('Some rules are not valid. Please fix them');
            return;
        }

        var pkg = new wiggle.packages({
            name: $scope.name,
            quota: parseInt($scope.quota),
            ram: parseInt($scope.ram),
            cpu_cap: parseInt($scope.cpu_cap),
            requirements: $scope.rules.filter(function(item) {
                return item['weight'];
            }).map(function(item) {

                var data = {
                    weight: item.weight.value
                }

                //Weight is always present. Others depends.
                switch (data.weight) {

                    case 'scale':
                        data.attribute = item.attribute;
                        data.low = item.low;
                        data.high = item.high;
                        break;

                    case 'random':
                        data.low = item.low;
                        data.high = item.high;
                        break;

                    default:
                        data.value = utils.deserialize(item.value);
                        data.attribute = item.attribute;
                        data.condition = item.condition;
                        break;
                }

                return data;
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

        $scope.attributeOptions = [ 
            'resources.free-memory', 'resources.total-memory', 'resources.provisioned-memory',
            'resources.free', 'resources.size', 'resources.used',
            'pools.zones.free', 'health', 'networks', 'name', 'virtualisation',
            'resources.l1hits', 'resources.l1miss', 'resources.l1size']

        $scope.weightOptions = [
            {group: 'Condition', value: 'must'}, 
            {group: 'Condition', value: 'cant'},
            {group: 'Special', value: 'scale'},
            {group: 'Special', value: 'random'},
        ]
        for (var i=1; i<10; i++)
            $scope.weightOptions.push({group: 'Priority', value: i})
        for (var i=1; i<10; i++)
            $scope.weightOptions.push({group: 'Priority', value: 10*i})
        for (var i=1; i<10; i++)
            $scope.weightOptions.push({group: 'Priority', value: -i})
        for (var i=1; i<10; i++)
            $scope.weightOptions.push({group: 'Priority', value: -10*i})

        $scope.conditionOptions = [
            '>=', '>', '=<', '<', '=:=', '=/=',
            'subset', 'superset', 'disjoint', 'element'
        ]
    }

    $scope.init()
})
