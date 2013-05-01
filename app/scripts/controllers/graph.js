'use strict';

fifoApp.controller('GraphCtrl', function($scope, wiggle, user) {
    $scope.setTitle('Graph');

    var setup = function(parentEl, opts) {
        opts = opts || {w: 500, h: 200}
        opts.margin = opts.margin || {}
        opts.margin.w = opts.margin.w || 0
        opts.margin.h = opts.margin.w || 0

        var canvas = d3.select(parentEl)
            .append('svg')
                .attr("width",  opts.w + opts.margin.w * 2)
                .attr("height", opts.h + opts.margin.h * 2)
            .append('g')
                .attr("transform", "translate(" + opts.margin.w + "," + opts.margin.h + ")")

        return canvas;

    }

    var update = function() {

        var vmsNode = canvas.selectAll('g.vm').data($scope.vms)
        var newVmsNodes = vmsNode.enter()
            .append('g')
                .attr('class', 'vm')
                .attr('transform', function(d, i) { return "translate(" + (i*45 + 100) + "," + (40 + i*15) + ")" })

        var logoSize = 30;
        //newVmsNodes.append('circle')
        //    .attr('r', function(d) {return d.config.ram / 150})
        newVmsNodes.append('text')
            .attr('x', logoSize/2)
            .attr('y', -4)
            .text(function(d) { return d.config.alias })

        newVmsNodes.append('text')
            .attr('class', 'ram')
            .attr('x', logoSize/2)
            .attr('y', 10)
            .text(function(d) { return d.config.ram/1024 + 'GB' })

        newVmsNodes.append('image')
            .attr('xlink:href', function(d) { return 'images/logos/' + (d.config._dataset && d.config._dataset.os || 'unknown') + '.png' })
            .attr('width', logoSize)
            .attr('height', logoSize)
            .attr('x', -logoSize/2)
            .attr('y', -logoSize/2)

        var hypersNode = canvas.selectAll('g.hyper').data($scope.hypers)
        var newHypersNode = hypersNode.enter()
            .append('g')
                .attr('class', 'hyper')
                .attr('transform', function(d, i) { return "translate(" + (200) + "," + (200) + ")" })
        var hyperSize = 60;
        newHypersNode.append('image')
            .attr('xlink:href', 'images/server.png')
            .attr({
                width: hyperSize,
                height: hyperSize,
                x: -hyperSize/2,
                y: -hyperSize/2
            })
        newHypersNode.append('text')
            .attr('y', hyperSize/2)
            .attr('text-anchor', 'middle')
            .text(function(d) { return d.name })

    }

    var canvas = window.viz = setup('#container', {w: 800, h: 400});

    $scope.vms = [];
    $scope.hypers = [];
    window.vms = $scope.vms;
    window.hypers = $scope.hypers

    $scope.$watch('vms.length', update);

    var init = function() {
        wiggle.vms.list(function(ids) {
            ids.forEach(function(id) {
                wiggle.vms.get({id: id}, function(res) {
                    $scope.vms.push(res)
                })
            })
        })

        wiggle.hypervisors.list(function(ids) {
            ids.forEach(function(id) {
                wiggle.hypervisors.get({id: id}, function(res) {
                    $scope.hypers.push(res)
                })
            })
        })
    }

    $scope.$on('user_login', init)
    if (user.logged()) init()
    

});