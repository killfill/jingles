/**
 * tty.js
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 */

;(function() {

    /**
     * Elements
     */

    var document = this.document
    , window = this
    , root
    , body
    , h1
    , open
    , lights;

    /**
     * Initial Document Title
     */

    var initialTitle = document.title;

    /**
     * Helpers
     */

    var EventEmitter = Terminal.EventEmitter
    , isMac = Terminal.isMac
    , inherits = Terminal.inherits
    , on = Terminal.on
    , off = Terminal.off
    , cancel = Terminal.cancel;

    /**
     * tty
     */

    var tty = new EventEmitter;

    /**
     * Shared
     */

    tty.socket;
    tty.windows;
    tty.terms;
    tty.elements;

    /**
     * Open
     */

    if ('MozWebSocket' in window) {
        WebSocket = MozWebSocket;
    }
    var uuid= $(document).getUrlParam("uuid");

    tty.open = function() {
        tty.windows = [];
        tty.terms = {};

        tty.elements = {
            root: document.documentElement,
            body: document.body,
            h1: document.getElementsByTagName('h1')[0],
            open: document.getElementById('open'),
            lights: document.getElementById('lights')
        };

        root = tty.elements.root;
        body = tty.elements.body;
        h1 = tty.elements.h1;
        open = tty.elements.open;
        lights = tty.elements.lights;

        var init_socket;
        init_socket = function (atty) {
            atty.socket = new WebSocket(window.location.origin.replace(/^http/, "ws") +
                                       "/api/0.1.0/vms/" + uuid + "/console");
            setInterval(function () {
                atty.socket.send("");
            }, 5000);

            atty.socket.onopen = function() {
                console.info("opened");
                tty.emit('connect');
            };
            atty.socket.onmessage = function(data) {
                tty.terms[0].write(data.data);
            };

            atty.socket.onclose = function(id) {
                console.error("closed");
                setTimeout(function () {
                    init_socket(atty)
                }, 5000);
            };
        };
        init_socket(tty);

        var w = new Window;
        tty.terms[0] = w.tabs[0];

        // XXX Clean this up.
        /*
        tty.socket.on('sync', function(terms) {
            console.log('Attempting to sync...');
            console.log(terms);

            tty.reset();

            var emit = tty.socket.emit;
            tty.socket.emit = function() {};

            Object.keys(terms).forEach(function(key) {
                var data = terms[key]
                , win = new Window
                , tab = win.tabs[0];

                delete tty.terms[tab.id];
                tab.pty = data.pty;
                tab.id = data.id;
                tty.terms[data.id] = tab;
                win.resize(data.cols, data.rows);
                tab.setProcessName(data.process);
                tty.emit('open tab', tab);
                tab.emit('open');
            });

            tty.socket.emit = emit;
        });*/

        // We would need to poll the os on the serverside
        // anyway. there's really no clean way to do this.
        // This is just easier to do on the
        // clientside, rather than poll on the
        // server, and *then* send it to the client.
        setInterval(function() {
            var i = tty.windows.length;
            while (i--) {
                if (!tty.windows[i].focused) continue;
                // tty.windows[i].focused.pollProcessName();
            }
        }, 2 * 1000);

        // Keep windows maximized.
        on(window, 'resize', function() {
            var i = tty.windows.length
            , win;

            while (i--) {
                win = tty.windows[i];
                if (win.minimize) {
                    win.minimize();
                    win.maximize();
                }
            }
        });

        tty.emit('load');
        tty.emit('open');
    };

    /**
     * Reset
     */

    tty.reset = function() {
        var i = tty.windows.length;
        while (i--) {
            tty.windows[i].destroy();
        }

        tty.windows = [];
        tty.terms = {};

        tty.emit('reset');
    };

    /**
     * Lights
     */

    tty.toggleLights = function() {
        root.className = !root.className
            ? 'dark'
            : '';
    };

    /**
     * Window
     */

    function Window(socket) {
        var self = this;

        EventEmitter.call(this);

        var el
        , grip
        , bar
        , button
        , title;

        el = document.createElement('div');
        el.className = 'window';

        grip = document.createElement('div');
        grip.className = 'grip';

        bar = document.createElement('div');
        bar.className = 'bar';

        button = document.createElement('div');
        button.innerHTML = '~';
        button.title = 'new/close';
        button.className = 'tab';

        title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = '';

        this.socket = socket || tty.socket;
        this.element = el;
        this.grip = grip;
        this.bar = bar;
        this.button = button;
        this.title = title;

        this.tabs = [];
        this.focused = null;

        this.cols = Terminal.geometry[0];
        this.rows = Terminal.geometry[1];

        el.appendChild(grip);
        el.appendChild(bar);
        bar.appendChild(button);
        bar.appendChild(title);
        body.appendChild(el);

        tty.windows.push(this);

        this.createTab();

        this.tabs[0].once('open', function() {
            tty.emit('open window', self);
            self.emit('open');
        });
    }

    inherits(Window, EventEmitter);

    Window.prototype.focus = function() {
        // Restack
        var parent = this.element.parentNode;
        if (parent) {
            parent.removeChild(this.element);
            parent.appendChild(this.element);
        }

        // Focus Foreground Tab
        this.focused.focus();

        tty.emit('focus window', this);
        this.emit('focus');
    };

    Window.prototype.destroy = function() {
        if (this.destroyed) return;
        this.destroyed = true;

        if (this.minimize) this.minimize();

        splice(tty.windows, this);
        if (tty.windows.length) tty.windows[0].focus();

        this.element.parentNode.removeChild(this.element);

        this.each(function(term) {
            term.destroy();
        });

        tty.emit('close window', this);
        this.emit('close');
    };

    Window.prototype.createTab = function() {
        return new Tab(this, this.socket);
    };

    /**
     * Tab
     */

    function Tab(win, socket) {
        var self = this;

        var cols = win.cols
        , rows = win.rows;

        Terminal.call(this, cols, rows);

        var button = document.createElement('div');
        button.className = 'tab';
        button.innerHTML = '\u2022';
        win.bar.appendChild(button);

        on(button, 'click', function(ev) {
            if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.shiftKey) {
                self.destroy();
            } else {
                self.focus();
            }
            return cancel(ev);
        });

        this.id = '';
        this.socket = socket || tty.socket;
        this.window = win;
        this.button = button;
        this.element = null;
        this.process = '';
        this.open();
        this.hookKeys();

        win.tabs.push(this);

/*
        this.socket.emit('create', cols, rows, function(err, data) {
            if (err) return self._destroy();
            self.pty = data.pty;
            self.id = data.id;
            tty.terms[self.id] = self;
            self.setProcessName(data.process);
            tty.emit('open tab', self);
            self.emit('open');
        });
*/
    };

    inherits(Tab, Terminal);

    // We could just hook in `tab.on('data', ...)`
    // in the constructor, but this is faster.
    Tab.prototype.handler = function(data) {
        this.socket.send(data);
    };

    // We could just hook in `tab.on('title', ...)`
    // in the constructor, but this is faster.
    Tab.prototype.handleTitle = function(title) {
        if (!title) return;

        title = sanitize(title);
        this.title = title;

        if (Terminal.focus === this) {
            document.title = title;
            // if (h1) h1.innerHTML = title;
        }

        if (this.window.focused === this) {
            this.window.bar.title = title;
            // this.setProcessName(this.process);
        }
    };

    Tab.prototype._write = Tab.prototype.write;

    Tab.prototype.write = function(data) {
        if (this.window.focused !== this) this.button.style.color = 'red';
        return this._write(data);
    };

    Tab.prototype._focus = Tab.prototype.focus;

    Tab.prototype.focus = function() {
        if (Terminal.focus === this) return;

        var win = this.window;

        // maybe move to Tab.prototype.switch
        if (win.focused !== this) {
            if (win.focused) {
                if (win.focused.element.parentNode) {
                    win.focused.element.parentNode.removeChild(win.focused.element);
                }
                win.focused.button.style.fontWeight = '';
            }

            win.element.appendChild(this.element);
            win.focused = this;

            win.title.innerHTML = this.process;
            document.title = this.title || initialTitle;
            this.button.style.fontWeight = 'bold';
            this.button.style.color = '';
        }

        this.handleTitle(this.title);

        this._focus();

        win.focus();

        tty.emit('focus tab', this);
        this.emit('focus');
    };

    Tab.prototype._resize = Tab.prototype.resize;

    Tab.prototype.resize = function(cols, rows) {
//        this.socket.emit('resize', this.id, cols, rows);
        this._resize(cols, rows);
        tty.emit('resize tab', this, cols, rows);
        this.emit('resize', cols, rows);
    };

    Tab.prototype.__destroy = Tab.prototype.destroy;

    Tab.prototype._destroy = function() {
        if (this.destroyed) return;
        this.destroyed = true;

        var win = this.window;

        this.button.parentNode.removeChild(this.button);
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        if (tty.terms[this.id]) delete tty.terms[this.id];
        splice(win.tabs, this);

        if (win.focused === this) {
            win.previousTab();
        }

        if (!win.tabs.length) {
            win.destroy();
        }

        // if (!tty.windows.length) {
        //   document.title = initialTitle;
        //   if (h1) h1.innerHTML = initialTitle;
        // }

        this.__destroy();
    };

    Tab.prototype.destroy = function() {
        if (this.destroyed) return;
 //       this.socket.emit('kill', this.id);
        this._destroy();
        tty.emit('close tab', this);
        this.emit('close');
    };

    Tab.prototype.hookKeys = function() {
        this.on('key', function(key, ev) {
            // ^A for screen-key-like prefix.
            if (Terminal.screenKeys) {
                if (this.pendingKey) {
                    this._ignoreNext();
                    this.pendingKey = false;
                    this.specialKeyHandler(key);
                    return;
                }

                // ^A
                if (key === '\x01') {
                    this._ignoreNext();
                    this.pendingKey = true;
                    return;
                }
            }

            // Alt-` to quickly swap between windows.
            if (key === '\x1b`') {
                var i = indexOf(tty.windows, this.window) + 1;

                this._ignoreNext();
                if (tty.windows[i]) return tty.windows[i].highlight();
                if (tty.windows[0]) return tty.windows[0].highlight();

                return this.window.highlight();
            }

            // URXVT Keys for tab navigation and creation.
            // Shift-Left, Shift-Right, Shift-Down
            if (key === '\x1b[1;2D') {
                this._ignoreNext();
                return this.window.previousTab();
            } else if (key === '\x1b[1;2B') {
                this._ignoreNext();
                return this.window.nextTab();
            } else if (key === '\x1b[1;2C') {
                this._ignoreNext();
                return this.window.createTab();
            }
        });
    };

    // tmux/screen-like keys
    Tab.prototype.specialKeyHandler = function(key) {
        var win = this.window;

        switch (key) {
        case '\x01': // ^A
            this.send(key);
            break;
        case 'c':
            win.createTab();
            break;
        case 'k':
            win.focused.destroy();
            break;
        case 'w': // tmux
        case '"': // screen
            break;
        default:
            if (key >= '0' && key <= '9') {
                key = +key;
                // 1-indexed
                key--;
                if (!~key) key = 9;
                if (win.tabs[key]) {
                    win.tabs[key].focus();
                }
            }
            break;
        }
    };

    Tab.prototype._ignoreNext = function() {
        // Don't send the next key.
        var handler = this.handler;
        this.handler = function() {
            this.handler = handler;
        };
        var showCursor = this.showCursor;
        this.showCursor = function() {
            this.showCursor = showCursor;
        };
    };

    /**
     * Program-specific Features
     */

    Tab.scrollable = {
        irssi: true,
        man: true,
        less: true,
        htop: true,
        top: true,
        w3m: true,
        lynx: true,
        mocp: true
    };

    Tab.prototype._bindMouse = Tab.prototype.bindMouse;

    Tab.prototype.bindMouse = function() {
        if (!Terminal.programFeatures) return this._bindMouse();

        var self = this;

        var wheelEvent = 'onmousewheel' in window
            ? 'mousewheel'
            : 'DOMMouseScroll';

        on(self.element, wheelEvent, function(ev) {
            if (self.mouseEvents) return;
            if (!Tab.scrollable[self.process]) return;

            if ((ev.type === 'mousewheel' && ev.wheelDeltaY > 0)
                || (ev.type === 'DOMMouseScroll' && ev.detail < 0)) {
                // page up
                self.keyDown({keyCode: 33});
            } else {
                // page down
                self.keyDown({keyCode: 34});
            }

            return cancel(ev);
        });

        return this._bindMouse();
    };

    /**
     * Helpers
     */

    function indexOf(obj, el) {
        var i = obj.length;
        while (i--) {
            if (obj[i] === el) return i;
        }
        return -1;
    }

    function splice(obj, el) {
        var i = indexOf(obj, el);
        if (~i) obj.splice(i, 1);
    }

    function sanitize(text) {
        if (!text) return '';
        return (text + '').replace(/[&<>]/g, '')
    }

    /**
     * Load
     */

    function load() {
        if (load.done) return;
        load.done = true;

        off(document, 'load', load);
        off(document, 'DOMContentLoaded', load);
        tty.open();
    }

    on(document, 'load', load);
    on(document, 'DOMContentLoaded', load);
    setTimeout(load, 200);

    /**
     * Expose
     */

    tty.Window = Window;
    tty.Tab = Tab;
    tty.Terminal = Terminal;

    this.tty = tty;

}).call(function() {
    return this || (typeof window !== 'undefined' ? window : global);
}());
