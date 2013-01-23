'use strict';

fifoApp.factory('howl', function($rootScope, $compile) {

    howl._wsMessage = function(e) {
        var msg = JSON.parse(e.data),
        type = msg.message && msg.message.event || 'main';

        $rootScope.$broadcast(type, msg)
        if (Config.mode == 'dev' && !msg.pong)
            console.debug('[howl] receive:', msg, type)
    }

    return {
        connect: howl.connect,
        join: howl.join,
        send: howl.send,
        disconnect: howl.disconnect
    }

});

var howl = {
    _connected: false,
    _token: false,
    _join_channels_on_connect: [],
    _wsOpen: function(e) {
        howl.send({token: howl._token});
        console.log('[howl] connection open')
        howl._connected = true

        //Join the pending channels..
        howl.join(howl._join_channels_on_connect)

        setInterval(function() {
            howl._connected == true && howl._token && howl.send({ping: 1})
        }, 1000);

    },

    _wsClose: function(e) {
        howl._connected = false
        if (!howl._token)
            return;
        console.log('[howl] connection closed, reconnecting in 5[s]...')
        setTimeout(howl.connect, 5000)
    },

    disconnect: function() {
        if (howl.ws) {
            howl.ws.close();
            howl.ws = null;
        }
        howl._connected = false;
        howl._token = null;
    },

    connect: function(token) {

        if (howl.ws)
            howl.disconnect();

        if (token)
            howl._token = token

        howl.ws = new WebSocket(Config.howl)
        howl.ws.onopen = howl._wsOpen
        howl.ws.onclose = howl._wsClose
        howl.ws.onmessage = howl._wsMessage
    },

    send: function(data) {
        if (Config.mode=='dev' && !data.ping)
            console.debug('[howl] send:   ', data)
        howl.ws.send(JSON.stringify(data))
    },

    join: function(channel) {
        if (typeof channel.forEach == 'function')
            return channel.forEach(howl.join)

        if (!howl._connected)
            return howl._join_channels_on_connect.push(channel)

        howl.send({join: channel})
    }

}
