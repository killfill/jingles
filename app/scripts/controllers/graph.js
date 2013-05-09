'use strict';

fifoApp.controller('GraphCtrl', function($scope, wiggle, user, $filter) {
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
            .data($scope.vms, function key (d) { return d.uuid })

        var newVmsNodes = $scope.vmsNodes.enter()
            .append('g')
                .attr('class', 'vm')
                .attr('opacity', function(d) { 
                    return d.state == 'running'? 1: 0.3
                })
                .call(forceLayout.drag)
                .on('mouseover', function(h) {

                    var pop = document.querySelector('#popover')
                    pop.style.display='block'
                    pop.style.top = h.y  + 25+ 'px'
                    pop.style.left = h.x + 210 + 'px'

                    pop.querySelector('.popover-title').innerHTML = h.config.alias + ':'
                    pop.querySelector('.popover-content').innerHTML = 'Memory: ' + h.config.ram/1024 + 'GB'

                })
                .on('mouseout', function() {
                    document.querySelector('#popover').style.display = 'none'
                })
                .on('click', function(d) {
                    window.open('#/virtual-machines/' + d.uuid, '_blank')
                })
                

        var logoSize = 30;

        newVmsNodes.append('circle')
            .attr('class', 'cpu')
            .attr('r', logoSize/2)
            .attr('fill', 'red')
            .attr('fill-opacity', 0)

        newVmsNodes.append('image')
            .attr('xlink:href', function(d) { return 'images/logos/' + (d.config._dataset && d.config._dataset.os || 'unknown') + '.png' })
            .attr('width', logoSize)
            .attr('height', logoSize)
            .attr('x', -logoSize/2)
            .attr('y', -logoSize/2)

        newVmsNodes.append('text')
            .attr('class', 'ram')
            .text(function(d) { return byteFormater(d.config.ram) })

        newVmsNodes.call(progressBarWidget({
            fill: 'rgb(255, 178, 39)',
            width: logoSize,
            height: 5
        }))

        $scope.vmsNodes.call(updateVms)
    }

    /* Build the Hypervisor nodes */
    var buildHypers = function() {
        $scope.hypersNodes = ($scope.hypersNodes || canvas.selectAll('g.hyper'))
            .data($scope.hypers, function key(d) { return d.name })

        var newHypersNode = $scope.hypersNodes.enter()
            .append('g')
                .attr('class', 'hyper')
                .call(forceLayout.drag)
                .on('mouseover', function(h) {

                    var pop = document.querySelector('#popover')
                    pop.style.display='block'
                    pop.style.top = h.y  + 25+ 'px'
                    pop.style.left = h.x + 210 + 'px'

                    pop.querySelector('.popover-title').innerHTML = h.name + ':'
                    pop.querySelector('.popover-content').innerHTML = 'Free memory: ' + 
                        parseInt(h.resources['free-memory']/1024) + ' of ' + 
                        parseInt(h.resources['total-memory']/1024) + 'GB'

                })
                .on('mouseout', function() {
                    document.querySelector('#popover').style.display = 'none'
                })
                .on('click', function(d) {
                    window.open('#/hypervisors/' + d.name, '_blank')
                })

        var hyperSize = 60;

        /* This is an experiment, should be handled more elegantly! */
         
        var min = d3.min($scope.hypers, function(d) {return d.resources['total-memory']})
        var max = d3.max($scope.hypers, function(d) {return d.resources['total-memory']})
        if (min == max) min = 8000
        var hyperScale = d3.scale.sqrt()
            .domain([min, max])
            .range([25, 60])
        newHypersNode.append('image')
            .attr('xlink:href', 'images/server.png')
            .attr({
                width: function(d) {return hyperScale(d.resources['total-memory'])},
                height: function(d) {return hyperScale(d.resources['total-memory'])},
                transform: function(d, i) { 
                    var middle = hyperScale(d.resources['total-memory']) / 2
                    return 'translate('+-middle+','+-middle+')'
                }
            })

        //Testing the concept :P
        var progressSize = hyperSize * 3/4

        newHypersNode.call(progressBarWidget({
            border: 'rgb(114, 74, 0)',
            fill: 'rgb(255, 178, 39)',
            width: progressSize,
            progress: function(d) {
                return d.resources['provisioned-memory'] / d.resources['total-memory']
            }
        }))

        newHypersNode.append('text')
            .attr('y', hyperSize/2)
            .attr('text-anchor', 'middle')
            .text(function(d) { return d.name })

        newHypersNode.append('text')
            .attr('class', 'ram')
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .text(function(d) { return byteFormater(d.resources['total-memory']) })
    }

    /* Add a progress bar */
    var progressBarWidget = function(opts) {
        opts.width = opts.width || 20
        opts.x = opts.x || -opts.width/2
        opts.y = opts.y || 11
        opts.height = opts.height || 5

        return function(sel) {
            sel.append('rect')
                .attr({
                    class: 'progress',
                    fill: opts.fill || 'green',
                    height: opts.height,
                    width: function(d) {
                        if (!opts.progress) return 0

                        if (typeof opts.progress == 'number')
                            return opts.progress * opts.width
                        
                        var val = opts.progress(d)
                        return val * opts.width
                    },
                    x: opts.x,
                    y: opts.y,
                })

            if (!opts.border) return;

            sel.append('rect')
                .attr({
                    class: 'progress-border',
                    fill: 'none',
                    stroke: opts.border || 'black',
                    'stroke-width': opts['stroke-width'] || 1,
                    height: opts.height,
                    width: opts.width,
                    x: opts.x,
                    y: opts.y,
                })
        }
    }

    /* Build the links between hypers and vm's */
    var buildLinks = function(linksArray) {
        $scope.links = ($scope.links || canvas.selectAll('line.link'))
            .data(linksArray);

        $scope.links
                .enter()
                    .insert('line', '.hyper')
                        .attr('class', 'link')
                        .attr('x1', function(d) {return d.source.x})
                        .attr('y1', function(d) {return d.source.y})
                        .attr('x2', function(d) {return d.target.x})
                        .attr('y2', function(d) {return d.target.y})
                        .attr('stroke-width', function(d) {
                            return d.target.config? 1: 0;
                        })
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

            /* Add links between hypers */
            nodes.forEach(function(other) {
                links.push({source: hIdx, target: hyperIdx[other.name]})
            })

            nodes.push(hyper)
        })
        $scope.vms.forEach(function(vm, idx) {
            nodes.push(vm)
            var hIdx = hyperIdx[vm.hypervisor]
            if (typeof hIdx == 'number')
                links.push({source: hIdx, target: nodes.length-1})
            else
                console.log('WARN: no hidx for ' + vm.hypervisor)
        })

        forceLayout.nodes(nodes).links(links).start()

        buildLinks(links)
    }

    /* Go and get the data */
    var getData = function() {
        wiggle.hypervisors.list(function(ids) {
            ids.forEach(function(id) {
                wiggle.hypervisors.get({id: id}, function(res) {
                    $scope.hypers.push(res)

                    //Load vms after hypers, so we can draw links and calculate force layout
                    if (ids.length == $scope.hypers.length) 
                        loadVms()
                })
            })
        })

        var loadVms = function() {
            wiggle.vms.list(function(ids) {
                ids.forEach(function(id) {
                    wiggle.vms.get({id: id}, function(res) {
                        $scope.vms.push(res)
                        $scope.vmsHash[id] = res

                        if (ids.length == $scope.vms.length)
                            buildWorld()
                    })
                })
            })    
        }

        var buildWorld = function() {

            /* Scale based on vms, not packages, there probably will be vms without packages.. */
            var minMax = d3.extent($scope.vms, function(d) {return d.config.ram})

            //Use square scale, becouse logo is square ~ ram.. :P
            $scope.vmScale = d3.scale.sqrt().domain(minMax).range([25, 40])

            buildHypers()
            buildVms()

            $scope.vms.forEach(function(vm) {
                //if (vm.uuid == '9e09239b-4001-4760-805b-8b2d3ad0a6e2') //kvm
                //if (vm.uuid == 'e7adb1b5-8124-4413-b5c8-4eef45a158ab') //zone
                howl.join(vm.uuid + '-metrics')
            })

            setupForceLayout()
        }
        
    }

    /* Charge each particle in the force layout */
    var layoutParticlesCharge = function(d) {
        //Charge is ~ to the ram.
        var charge;
        if (d.name)
            //hyper
            charge = -d.resources['total-memory']/50
        else
            charge = -d.config.ram/10

        return charge
    }

    /* D3 call for vm updates */
    var updateVms = function(sel) {

        var dur = 1500;

        /* Logo size based on ram */
        sel.each(function(d) {
            d._logoSize = $scope.vmScale(d.config.ram)
        })

        sel.select('text.ram')
            .transition()
                .duration(dur)
                .attr('x', function(d) {return d._logoSize*2/5})
                .attr('y', function(d) {return -d._logoSize/5})
                .text(function(d) { return byteFormater(d.config.ram) })

        sel.select('image')
            .transition()
                .duration(dur)
                .attr('width',  function(d) { return d._logoSize })
                .attr('height', function(d) { return d._logoSize })
                .attr('x', function(d) {return -d._logoSize/2})
                .attr('y', function(d) {return -d._logoSize/2})

        sel.select('circle.cpu')
            .transition()
                .duration(dur)
                .attr('r', function(d) {return d._logoSize / 2.5})

        sel.select('rect.progress')
            .transition()
                .duration(dur)
                .attr('y', function(d) { return d._logoSize * 2/5 })

        sel.select('circle.highlight')
            .transition()
                .duration(dur)
                .attr('r', function(d) { return d._logoSize/2 })

        forceLayout.charge(layoutParticlesCharge).start()
    }

    /* VM is updated. i.e. resize */
    var onVmUpdateEvent = function(_, d) {

        var changedVm = d.message.data
        changedVm.uuid = d.channel

        /* D3 replace the orig object when changing it in second .data call: 
            https://github.com/mbostock/d3/blob/master/src/selection/data.js#L52
           So, get the old one, merge the new ones there, and throw that one to d3!
           (to not loose x, y, and other data of the node).
         */

         var vm = $scope.vmsHash[changedVm.uuid]
         $.extend(true, vm, changedVm)

        /* Select the element based on the uuid to match up the previous version */
        var sel = $scope.vmsNodes.data([vm], function(d) { return d.uuid })
        sel.call(updateVms)

        sel.append('circle')
            .attr('class', 'highlight')
            .attr('r', 8)
            .attr('stroke', 'green')
            .attr('fill', 'none')
            .transition()
                .duration(1500)
                .attr('r', 30)
                .style('stroke-opacity', 0)
                .style('stroke-width', 5)
                .remove()
    }

    var onVmStateEvent = function(_, d) {
        var vm = $scope.vmsHash[d.channel]
        vm.state = d.message.data

        $scope.vmsNodes
            .data([vm], function(d) { return d.uuid })
            .transition()
                .attr('opacity', vm.state == 'running'? 1: 0.3)
    }

    var cpuScale = d3.scale.linear().domain([20, 100]).range([0, 0.85])
    var onCpuEvent = function(_, d) {
        var uuid = d.channel.split('-metrics')[0],
             vm = $scope.vmsHash[uuid]

        $scope.vmsNodes
            .data([vm], function(d) { return d.uuid })
            .select('circle.cpu')
                .transition()
                .attr('fill-opacity', cpuScale(d.message.data.usage))
    }

    var onMemoryEvent = function(_, d) {
        var uuid = d.channel.split('-metrics')[0],
            vm = $scope.vmsHash[uuid]

        //{physcap: 5368709120, rss: 0, swap: 4347887616, swapcap: 5368709120}
        var percent = d.message.data.rss / d.message.data.physcap

        $scope.vmsNodes
            .data([vm], function(d) {return d.uuid})
            .select('rect.progress')
                .transition()
                    .attr('width', function(d) {return percent * d._logoSize})
                    .attr('x', function(d) {
                        //center the bar
                        return - percent * d._logoSize / 2
                    })
    }

    var onNetworkEvent = function(_, d) {
        var uuid = d.channel.split('-metrics')[0],
            vm = $scope.vmsHash[uuid]

        console.log('NET', d.message.data)
    }

    var canvasOpts = {w: document.querySelector('#container').offsetWidth, h: window.innerHeight},
        canvas = setup('#container', canvasOpts),
        forceLayout = d3.layout.force()
            //.charge(-220)
            .charge(layoutParticlesCharge)
            .linkDistance(function(link) {
                console.log(link.target._logoSize)
                return link.target.config
                    //? 2.6 * link.target._logoSize - 5
                    ? 100
                    : 150
            })
            .size([canvasOpts.w, canvasOpts.h])
            .on('tick', function() {

                $scope.vmsNodes.attr('transform', function(d, i) { return "translate(" + (d.x) + "," + (d.y) + ")" })
                $scope.hypersNodes.attr('transform', function(d, i) { return "translate(" + (d.x) + "," + (d.y) + ")" })

                $scope.links.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

            })

    $scope.vms = []
    $scope.hypers = []
    $scope.vmsHash = {} //Search vms based on uuid.
    $scope.$on('user_login', getData)
    if (user.logged()) getData()

    var byteFormater = $filter('Mbytes')

    $scope.$on('update', onVmUpdateEvent)
    $scope.$on('state', onVmStateEvent)
    $scope.$on('cpu', onCpuEvent)
    $scope.$on('memstat', onMemoryEvent)

    //$scope.$on('net', onNetworkEvent)
    //$scope.$on('vfs', onNetworkEvent)

    /* Disconnect metrics monitor */
    $scope.$on('$destroy', function() {
        $scope.vms.forEach(function(vm) {
            howl.leave(vm.uuid + '-metrics');
        })
    });

    /* Could make the load incremental with something like this, if there are too many vms
    $scope.$watch('hypers.length', buildHypers)
    $scope.$watch('vms.length', function() {
        setupForceLayout()
        buildVms()
    });
    */


});