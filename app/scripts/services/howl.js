'use strict';

angular.module('fifoApp')
  .factory('howl', function ($rootScope) {

    howl._wsMessage = function(e) {
        var msg = howl.decode(e.data),
        type = msg.message && msg.message.event || 'main';
        $rootScope.$broadcast(type, msg)
        if (Config.mode == 'dev' && !msg.pong)
            console.debug('[howl] receive:', msg, type)
    }

    /* Put the connection info on the rootScope, so use can see it... */
    setInterval(function () {
        if ($rootScope.howlConnected === howl._connected) return;
        $rootScope.howlConnected = howl._connected;
        $rootScope.$digest();
    }, 1000);

    return {
        connect: howl.connect,
        join: howl.join,
        send: howl.send,
        disconnect: howl.disconnect,
        connected: function() {return howl._connected}
    }

  });

var howl = {
    _connected: false,
    _token: false,
    _join_channels_on_connect: [],
    decode: function(e) {
        var r = msgpack.unpack(new Uint8Array(e));
        return r;
    },
    encode: function(d) {
        return (new Uint8Array(msgpack.pack(d))).buffer;
    },
    _wsOpen: function(e) {

        var data = {token: howl._token}
        if (Config.mode=='dev' && !data.ping)
            console.debug('[howl] auth:   ', data)

        howl.ws.send(howl.encode(data))

        Config.mode == 'dev' && console.log('[howl] connection open')
        howl._connected = true

        //Join the pending channels..
        howl.join(howl._join_channels_on_connect)

        setInterval(function() {
            howl._connected == true && howl._token && howl.send({ping: 1})
        }, 1000);

    },
    _wsError: function(e) {
        howl._connected = false;
        console.log('WS ERROR:', e)
        console.log('[howl] connection error, reconnecting in 5[s]...')
        setTimeout(howl.connect, 5000)
    },
    _wsClose: function(e) {
        howl._connected = false;
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
            howl.disconnect()

        if (token)
            howl._token = token

        howl.ws = new WebSocket(Config.howl, 'msgpack')
        howl.ws.binaryType = "arraybuffer";
        howl.ws.onopen = howl._wsOpen
        howl.ws.onclose = howl._wsClose
        howl.ws.onmessage = howl._wsMessage
        howl.ws.onerror = howl._wsError
    },

    send: function(data) {
        if (Config.mode=='dev' && !data.ping)
            console.debug('[howl] send:   ', data)
        howl._connected && howl.ws && howl.ws.send(howl.encode(data))
    },

    join: function(channel) {
        if (typeof channel.forEach == 'function')
            return channel.forEach(howl.join)

        if (!howl._connected)
            return howl._join_channels_on_connect.push(channel)

        howl.send({join: channel})
    },
    leave: function(channel) {
        if (typeof channel.forEach == 'function')
            return channel.forEach(howl.leave)

        howl.send({leave: channel})
    }


}