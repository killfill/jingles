/**
 * Very simple jQuery Color Picker.
 *
 * Copyright (C) 2012 Tanguy Krotoff
 *
 * Licensed under the MIT license.
 */

(function($) {
  'use strict';

  /**
   * Constructor.
   */
  var SimpleColorPicker = function(select, options) {
    this.init('simplecolorpicker', select, options);
  };

  /**
   * SimpleColorPicker class.
   */
  SimpleColorPicker.prototype = {
    constructor: SimpleColorPicker,

    init: function(type, select, options) {
      this.type = type;

      this.$select = $(select);
      this.options = $.extend({}, $.fn.simplecolorpicker.defaults, options);

      this.$select.hide();

      // Trick: fix span alignment
      // When a span does not contain any text, its alignment is not correct
      var fakeText = '&nbsp;&nbsp;&nbsp;&nbsp;';

      // Build the list of colors
      // <div class="selected" title="Green" style="background-color: #7bd148;" role="button"></div>
      var colorList = '';
      $('option', this.$select).each(function() {
        var option = $(this);
        var color = option.val();
        var title = option.text();
        var selected = '';
        if (option.attr('selected')) {
          selected = 'class="selected"';
        }
        colorList += '<div ' + selected + ' title="' + title + '" style="background-color: ' + color + ';" role="button" tabindex="0">'
                     + fakeText
                     + '</div>';
      });

      if (this.options.picker) {
        var selectText = this.$select.find('option:selected').text();
        var selectValue = this.$select.val();
        this.$icon = $('<span class="simplecolorpicker icon btn btn-xs" title="' + selectText + '" style="background-image: none; background-color: ' + selectValue + ';" role="button" tabindex="0">'
                      + 'Color'
                      + '</span>').insertAfter(this.$select);
        this.$icon.on('click.' + this.type, $.proxy(this.showPicker, this));

        this.$picker = $('<span class="simplecolorpicker picker"></span>').appendTo(document.body);
        this.$picker.html(colorList);
        this.$picker.on('click.' + this.type, $.proxy(this.click, this));

        // Hide picker when clicking outside
        $(document).on('mousedown.' + this.type, $.proxy(this.hidePicker, this));
        this.$picker.on('mousedown.' + this.type, $.proxy(this.mousedown, this));
      } else {
        this.$inline = $('<span class="simplecolorpicker inline"></span>').insertAfter(this.$select);
        this.$inline.html(colorList);
        this.$inline.on('click.' + this.type, $.proxy(this.click, this));
      }
    },

    showPicker: function() {
      var bootstrapArrowWidth = 16; // Empirical value
      var pos = this.$icon.offset();
      this.$picker.css({
        left: pos.left + this.$icon.width() / 2 - bootstrapArrowWidth, // Middle of the icon
        top: pos.top + this.$icon.outerHeight()
      });

      this.$picker.show(this.options.delay);
    },

    hidePicker: function() {
      this.$picker.hide(this.options.delay);
    },

    click: function(e) {
      var target = $(e.target);
      if (target.length === 1) {
        if (target[0].nodeName.toLowerCase() === 'div') {
          // When you click on a color

          var color = target.css('background-color');
          var title = target.attr('title');

          // Mark this div as the selected one
          target.siblings().removeClass('selected');
          target.addClass('selected');

          if (this.options.picker) {
            this.$icon.css('background-color', color);
            this.$icon.attr('title', title);
            this.hidePicker();
          }

          // Change HTML select value
          this.$select.val(this.rgb2hex(color)).change();
        }
      }
    },

    /**
     * Prevents the mousedown event from "eating" the click event.
     */
    mousedown: function(e) {
      e.stopPropagation();
      e.preventDefault();
    },

    /**
     * Converts a RGB color to its hexadecimal value.
     *
     * See http://stackoverflow.com/questions/1740700/get-hex-value-rather-than-rgb-value-using-jquery
     */
    rgb2hex: function(rgb) {
      function hex(x) {
        return ('0' + parseInt(x, 10).toString(16)).slice(-2);
      }

      var matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (matches === null) {
        // Fix for Internet Explorer < 9
        // Variable rgb is already a hexadecimal value
        return rgb;
      } else {
        return '#' + hex(matches[1]) + hex(matches[2]) + hex(matches[3]);
      }
    },

    destroy: function() {
      if (this.options.picker) {
        this.$icon.off('.' + this.type);
        this.$icon.remove();
        this.$picker.off('.' + this.type);
        this.$picker.remove();
        $(document).off('.' + this.type);
      } else {
        this.$inline.off('.' + this.type);
        this.$inline.remove();
      }

      this.$select.removeData(this.type);
      this.$select.show();
    }
  };

  /**
   * Plugin definition.
   * How to use: $('#id').simplecolorpicker()
   */
  $.fn.simplecolorpicker = function(option) {
    // For HTML element passed to the plugin
    return this.each(function() {
      var $this = $(this),
        data = $this.data('simplecolorpicker'),
        options = typeof option === 'object' && option;
      if (data === undefined) {
        $this.data('simplecolorpicker', (data = new SimpleColorPicker(this, options)));
      }
      if (typeof option === 'string') {
        data[option]();
      }
    });
  };

  /**
   * Default options.
   */
  $.fn.simplecolorpicker.defaults = {
    // Animation delay
    delay: 0,

    // Show the picker or make it inline
    picker: false
  };

})(jQuery);
