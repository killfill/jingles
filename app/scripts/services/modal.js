'use strict';

fifoApp.factory('modal', function($compile) {

    return {

        confirm: function(opts, cb) {
            opts = opts || {}
            opts.header = opts.header || 'Please confirm'
            opts.btnText = opts.btnText || 'Confirm'
            opts.btnClass = opts.btnClass || 'btn-primary'
            opts.body = opts.body || 'Are you sure?'

            var el = $('#dialog-modal')
            .removeClass('hide')

            el.find('h3').html(opts.header)
            el.find('.modal-body').html(opts.body)

            var btn = el.find('a.btn').last()
            btn.addClass(opts.btnClass)
            btn.html(opts.btnText)

            btn.unbind('click').click(cb)
            el.modal(opts)
        }

    }

})