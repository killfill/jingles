'use strict';

fifoApp.controller('GraphCtrl', function($scope, wiggle, user, $filter, status) {
    $scope.setTitle('Graph');

    var redraw = function() {

      $scope.zoomValue = d3.event.scale
      $scope.$digest()

      canvas.attr("transform",
        " translate(" + d3.event.translate + ")" + 
        " scale("     + d3.event.scale + ")");

    }

    $scope.$watch('zoomValue', function(val) {
      canvas.attr('transform', 'scale(' + val + ')');
    })

    $scope.distanceValue = 100
    $scope.$watch('distanceValue', function(val) {
      forceLayout.linkDistance(linkDistance).start()
    })

    $scope.chargeValue = 0.1
    $scope.$watch('chargeValue', function(val) {
      forceLayout.charge(layoutParticlesCharge).start()
    })

    $scope.elasticityValue = 0.15
    $scope.$watch('elasticityValue', function(val) {
      forceLayout.linkStrength(1-val).start()
    })

    $scope.reset = function() {
      document.querySelector('#zoomBar').value = 1;
      canvas.attr("transform",'translate(0,0)');
      $scope.distanceValue = 100
      $scope.zoomValue = 1
      $scope.chargeValue = 0.1
      $scope.elasticityValue = 0.15
    }

    /* Setup canvas */
    var setup = function(parentEl, opts) {
        opts = opts || {w: '100%', h: '100%'}
        opts.margin = opts.margin || {}
        opts.margin.w = opts.margin.w || 0
        opts.margin.h = opts.margin.w || 0

        var canvas = d3.select(parentEl)
            .append('svg')
              .attr('width',   '100%')
              .attr('height',  '100%')
              //.attr('viewBox', '0 0 1024 768')
              //.attr('preserveAspectRatio', 'xMidYMid meet')
              .call(d3.behavior.zoom().on('zoom', redraw))
            .append('g')
                .attr("transform", "translate(" + opts.margin.w + "," + opts.margin.h + ")")

        document.canvas = canvas;
        return canvas;

    }

    /* Build the VM nodes */
    var buildVms = function() {

        $scope.vmsNodes = ($scope.vmsNodes || canvas.selectAll('g.vm'))
            .data(d3.values($scope.vmsHash), function key (d) { return d.uuid })

        var newVmsNodes = $scope.vmsNodes.enter()
            .append('g')
                .attr('class', 'vm')
                .attr('opacity', function(d) { 
                    return d.state == 'running'? 1: 0.3
                })
                .call(forceLayout.drag)
                .on('mouseover', function(h) {
                  $scope.vm = h
                  $scope.$digest()
                })
                .on('mouseout', function() {
                  $scope.vm = undefined
                  $scope.$digest()
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

    var hyperSize = 60

    var hyperMemThredhold = Config.could_test.filter(function(d) { if (d.element=='memory') return d; }).pop().max
    var hyperMemoryColor = function(perc) { return perc > hyperMemThredhold? 'red': 'rgb(255, 178, 39)'; }
    /* Build the Hypervisor nodes */
    var buildHypers = function() {
        $scope.hypersNodes = ($scope.hypersNodes || canvas.selectAll('g.hyper'))
            .data(d3.values($scope.hypersHash), function key(d) { return d.name })

        var newHypersNode = $scope.hypersNodes.enter()
            .append('g')
                .attr('class', 'hyper')
                .call(forceLayout.drag)
                .on('mouseover', function(h) {
                  $scope.hyper = h
                  $scope.$digest()
                })
                .on('mouseout', function() {
                  $scope.hyper = undefined
                  $scope.$digest()
                })
                .on('click', function(d) {
                  window.open('#/hypervisors/' + d.name, '_blank')
                })

        /* This is an experiment, should be handled more elegantly! */
         
        var min = d3.min(d3.values($scope.hypersHash), function(d) {return d.resources['total-memory']})
        var max = d3.max(d3.values($scope.hypersHash), function(d) {return d.resources['total-memory']})
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
            fill: function(d) {return hyperMemoryColor(d.resources['provisioned-memory']/ d.resources['total-memory']);},
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
            .data(d3.values(linksArray), function(l) {return l.target.uuid}); //map by the target vm uuid

        $scope.links
                .enter()
                    .insert('line', '.hyper')
                        .attr('class', 'link')
                        .attr('x1', function(d) {return d.source.x})
                        .attr('y1', function(d) {return d.source.y})
                        .attr('x2', function(d) {return d.target.x})
                        .attr('y2', function(d) {return d.target.y})
                        .attr('stroke', 'rgba(114, 144, 160, 0.4)')
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
        d3.values($scope.hypersHash).forEach(function(hyper, hIdx) {
            hyperIdx[hyper.name] = hIdx

            /* Add links between hypers */
            nodes.forEach(function(other) {
                links.push({source: hIdx, target: hyperIdx[other.name]})
            })

            nodes.push(hyper)
        })
        d3.values($scope.vmsHash).forEach(function(vm, idx) {
            nodes.push(vm)
            var hIdx = hyperIdx[vm.hypervisor]
            if (typeof hIdx == 'number')
                links.push({source: hIdx, target: nodes.length-1})
            else
                console.log('WARN: no hidx for ' + vm.hypervisor)
        })

        forceLayout.nodes(nodes).links(links).start()

        /* Build the links hash */
        links.forEach(function(link) {
            $scope.linksHash[link.target.uuid] = link
        })

        buildLinks($scope.linksHash)
        resizeForceLayout()
    }

    /* Go and get the data */
    var getData = function() {
        wiggle.hypervisors.list(function(ids) {

            ids.length > 0 && status.update('Loading hypervisors', {total: ids.length})
            ids.forEach(function(id) {
                wiggle.hypervisors.get({id: id}, function(res) {

                    status.update('Loading hypervisors', {add: 1})
                    $scope.hypersHash[res.name] = res

                    //Load vms after hypers, so we can draw links and calculate force layout
                    if (ids.length == Object.keys($scope.hypersHash).length)
                        loadVms()
                })
            })
        })

        var loadVms = function() {
            wiggle.vms.list(function(ids) {
                ids.length > 0 && status.update('Loading machines', {total: ids.length})

                ids.forEach(function(id) {
                    wiggle.vms.get({id: id}, function(res) {

                        status.update('Loading machines', {add: 1})
                        $scope.vmsHash[id] = res

                        if (ids.length == Object.keys($scope.vmsHash).length)
                            buildWorld()
                    })
                })
            })    
        }

        var buildWorld = function() {
            /* Scale based on vms, not packages, there probably will be vms without packages.. */
            var minMax = d3.extent(d3.values($scope.vmsHash), function(d) {return d.config.ram})

            //Use square scale, becouse logo is square ~ ram.. :P
            $scope.vmScale = d3.scale.sqrt().domain(minMax).range([25, 40])

            buildHypers()
            buildVms()

            d3.values($scope.vmsHash).forEach(function(vm) {
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
            charge = -d.resources['total-memory'] * 0.02
        else
            charge = -d.config.ram * $scope.chargeValue

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

    /* VM status updated: stopped, started, etc. */
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

    var networkScale = d3.scale.linear().domain([2048, 2048]).range([1, 7]),
        max = 2048
    var onNetworkEvent = function(_, d) {
        var uuid = d.channel.split('-metrics')[0],
            link = $scope.linksHash[uuid],
            data = d.message.data

        /* Bukets for remember old values */
        link.target.netActivity = link.target.netActivity || {}

        /* netActivity = {net0: 123, net1: 3443} */
        var netActivity = link.target.netActivity,
            newActivity = data.obytes64 + data.rbytes64,
            lastActivity = netActivity[data.ifname]

        /* Save last value */
        link.target.netActivity[data.ifname] = newActivity

        /* ticks are ~ 1 per second, so this should be bps....*/
        var bps = newActivity - lastActivity,
            label = $filter('bytes')(bps)

        if (bps > max) {
            max = bps
            networkScale.domain([2048, max])
            //console.log('MAX=', max, label)
        }

        //console.log('->', link.target.config.alias, data.ifname, label)

        $scope.links
            .data([link], function(d) {return d.target.uuid;})
            .transition()
                .attr('stroke-width', bps>2048? networkScale(bps): 1 )
                .attr('stroke',       bps>2048? 'blue': 'rgba(114, 144, 160, 0.4)')
    }

    var onVmDeleteEvent = function(_, d) {
        var uuid = d.channel
        delete $scope.vmsHash[uuid]
        var sel = $scope.vmsNodes
            .data(d3.values($scope.vmsHash), function(d) {return d.uuid})
            .exit()

        delete $scope.linksHash[uuid]
        $scope.links
            .data(d3.values($scope.linksHash), function(d) {return d.target.uuid})
            .exit()
                .remove()

        sel.append('circle')
            .attr('class', 'highlight')
            .attr('r', 40)
            .attr('stroke', 'red')
            .attr('fill', 'none')
            .transition()
                .duration(1000)
                .attr('r', 8)
                .style('stroke-opacity', 0)
                .style('stroke-width', 5)
                .remove()

        sel.transition()
            .delay(1000)
            .remove()

    }

    var onHyperMemoryChangeEvent = function(_, d) {
        var name = d.channel,
            data = d.message.data,
            hyper = $scope.hypersHash[name]

        var percent = data.provisioned / (data.provisioned + data.free)

        $scope.hypersNodes
            .data([hyper], function(d) {return d.name})
            .select('.progress')
            .transition()
                .attr('width', percent * hyperSize * 3/4)
                .attr('fill', hyperMemoryColor(percent))
    }

    var linkDistance = function(link) {
        return link.target.config ? $scope.distanceValue : 150
    }
    var canvas = setup('#container'),
      forceLayout = d3.layout.force()
        //.charge(-220)
        .charge(layoutParticlesCharge)
        .linkDistance(linkDistance)
        .linkStrength(0.85)
        .on('tick', function() {

            if (!$scope.vmsNodes) return;

            $scope.vmsNodes.attr('transform', function(d, i) { return "translate(" + (d.x) + "," + (d.y) + ")" })
            $scope.hypersNodes.attr('transform', function(d, i) { return "translate(" + (d.x) + "," + (d.y) + ")" })

            $scope.links.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

        })

    var resizeForceLayout = function() {
      forceLayout && forceLayout
        .size([$('svg').width(), $('svg').height()])
        .start()
    }
    $(window).resize(resizeForceLayout)
    

    $scope.hypersHash = {}
    $scope.vmsHash = {} //Search vms based on uuid.
    $scope.linksHash = {}
    
    $scope.$on('user_login', getData)
    if (user.logged()) getData()

    var byteFormater = $filter('Mbytes')

    $scope.$on('update', onVmUpdateEvent)
    $scope.$on('state', onVmStateEvent)
    $scope.$on('cpu', onCpuEvent)
    $scope.$on('memstat', onMemoryEvent)

    $scope.$on('net', onNetworkEvent)
    //$scope.$on('vfs', onNetworkEvent)

    $scope.$on('delete', onVmDeleteEvent)
    $scope.$on('memorychange', onHyperMemoryChangeEvent)

    /* Disconnect metrics monitor */
    $scope.$on('$destroy', function() {
        d3.values($scope.vmsHash).forEach(function(vm) {
            howl.leave(vm.uuid + '-metrics');
        })

        poll && clearInterval(poll);
    });

    //Polling sucks, but if we want to show new Vms were creating there is still no other choise.
    //Disabled by default.. :P
    var pollForNewVms = function() {
      wiggle.vms.list(function(ids) {
        ids.forEach(function(id) {
          if ($scope.vmsHash[id]) return;

          wiggle.vms.get({id: id}, function(res) {
            $scope.vmsHash[id] = res

            buildVms()
            setupForceLayout()

            howl.join(id)
            howl.join(id + '-metrics')
          })

        })
      })
    }

    var poll = Config.newVmPolling && setInterval(pollForNewVms, Config.newVmPolling * 1000)

    /* Could make the load incremental with something like this, if there are too many vms
    $scope.$watch('hypers.length', buildHypers)
    $scope.$watch('vms.length', function() {
        setupForceLayout()
        buildVms()
    });
    */

    document.getElementById('fullscreen').onclick = function() {

      /* Bloody prefixes.. */
      var goFull = function(el) {
        if(el.requestFullScreen) {
          el.requestFullScreen();
        } else if(el.mozRequestFullScreen) {
          el.mozRequestFullScreen();
        } else if(el.webkitRequestFullScreen) {
          el.webkitRequestFullScreen();
        }
      }

      var cancelFull = function() {
        if(document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if(document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if(document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }

      var inFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
      
      if (inFullScreen)
        cancelFull()
      else
        goFull(document.getElementById('container'))
    }

});