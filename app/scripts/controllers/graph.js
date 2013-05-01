'use strict';

fifoApp.controller('GraphCtrl', function($scope, wiggle, user) {
    $scope.setTitle('Graph');

    /* Setup canvas */
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

    /* Build the VM nodes */
    var buildVms = function() {

        $scope.vmsNodes = ($scope.vmsNodes || canvas.selectAll('g.vm'))
            .data($scope.vms)

        var newVmsNodes = $scope.vmsNodes.enter()
            .append('g')
                .attr('class', 'vm')
                .call(forceLayout.drag)

        var logoSize = 30;
        //newVmsNodes.append('circle')
        //    .attr('r', function(d) {return d.config.ram / 150})
        newVmsNodes.append('text')
            .attr('class', 'alias')
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

    }

    /* Build the Hypervisor nodes */
    var buildHypers = function() {

        $scope.hypersNodes = ($scope.hypersNodes || canvas.selectAll('g.hyper'))
            .data($scope.hypers)
        var newHypersNode = $scope.hypersNodes.enter()
            .append('g')
                .attr('class', 'hyper')
                .call(forceLayout.drag)
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

    /* Build the links between hypers and vm's */
    var buildLinks = function(linksArray) {
        $scope.links = ($scope.links || canvas.selectAll('line.link'))
            .data(linksArray);

        $scope.links
                .enter()
                    .append('line')
                        .attr('class', 'link')
                        .attr('x1', function(d) {return d.source.x})
                        .attr('y1', function(d) {return d.source.y})
                        .attr('x2', function(d) {return d.target.x})
                        .attr('y2', function(d) {return d.target.y})
    }

    /* Setup the force layout and build */
    var setupForceLayout = function() {
        var links = [],
            nodes = []

        /* Connect every hyper with its vm.
           Add all node types into a common 'nodes' object, and calculate the links on them,
           so the force layout can work them out */
        var hyperIdx = {}
        $scope.hypers.forEach(function(hyper, hIdx) {
            hyperIdx[hyper.name] = hIdx
            nodes.push(hyper)
        })
        $scope.vms.forEach(function(vm, idx) {
            nodes.push(vm)
            links.push({source: hyperIdx[vm.hypervisor], target: nodes.length-1})
        })

        forceLayout.nodes(nodes).links(links).start()

        buildLinks(links)
    }

    var canvasOpts = {w: 800, h: 400},
        canvas = window.viz = setup('#container', canvasOpts),

        forceLayout = d3.layout.force()
            .charge(-220)
            .linkDistance(100)
            .size([canvasOpts.w, canvasOpts.h])
            .on('tick', function() {

                $scope.links.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                $scope.vmsNodes.attr('transform', function(d, i) { return "translate(" + (d.x) + "," + (d.y) + ")" })
                $scope.hypersNodes.attr('transform', function(d, i) { return "translate(" + (d.x) + "," + (d.y) + ")" })

            })

    $scope.vms = [];
    $scope.hypers = [];
    window.vms = $scope.vms;
    window.hypers = $scope.hypers;
    var Xlinks = 0;
    var Xnodes = 0;

    $scope.$watch('hypers.length', buildHypers);
    $scope.$watch('vms.length', function() {
        //if (vms.length<12) return;
        buildVms()
        /* Trigger if hypers are present, for the link building */
        $scope.hypers.length && setupForceLayout()
    });

    var init = function() {

        wiggle.hypervisors.list(function(ids) {
            ids.forEach(function(id) {
                wiggle.hypervisors.get({id: id}, function(res) {
                    $scope.hypers.push(res)
                })
            })
        })

        wiggle.vms.list(function(ids) {
            ids.forEach(function(id) {
                wiggle.vms.get({id: id}, function(res) {
                    $scope.vms.push(res)
                })
            })
        })

        
    }

    $scope.$on('user_login', init)
    if (user.logged()) init()
    

});