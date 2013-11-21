/*jslint white: false */
/*global window, $, Util, RFB, */

function updateState(rfb, state, oldstate, msg) {
    var s, sb, cad, level;
    s = $D('noVNC_status');
    sb = $D('noVNC_status_bar');
    cad = $D('sendCtrlAltDelButton');
    switch (state) {
    case 'failed':       level = "error";  break;
    case 'fatal':        level = "error";  break;
    case 'normal':       level = "info"; break;
    case 'disconnected': level = "info"; break;
    case 'loaded':       level = "info"; break;
    default:             level = "warn";   break;
    }

    if (state === "normal" && cad) { cad.disabled = false; }
    else                    { if (cad) cad.disabled = true; }

    if (typeof(msg) !== 'undefined' && sb && s) {
        s.setAttribute("class", "span9 alert alert-" + level);
        s.innerHTML = msg;
    }
}
function sendCtrlAltDel() {
    rfb.sendCtrlAltDel();
    return false;
}

$(function () {
    var path;

    $D('sendCtrlAltDelButton').style.display = "inline";
    $D('sendCtrlAltDelButton').onclick = sendCtrlAltDel;

    // By default, use the host and port of server that served this file

    var uuid= $(document).getUrlParam("uuid");
    var host = WebUtil.getQueryVar('host', window.location.hostname);
    var port = WebUtil.getQueryVar('port', window.location.port);
    if (port == "") {
        if (window.location.protocol === "https:") {
            port = "443";
        } else {
            port = "80";
        }
    }

    document.title = "VNC - " + uuid;

    path = "api/0.1.0/vms/" + uuid + "/vnc";
    rfb = new RFB({'target':       $D('noVNC_canvas'),
                   'encrypt':      (window.location.protocol === "https:"),
                   'true_color':   true,
                   'local_cursor': true,
                   'shared':       true,
                   'view_only':    false,
                   'updateState':  updateState});
    rfb.connect(host, port, "", path);
});
