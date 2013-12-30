!function ($) { 'use strict'; // jshint ;_;

 	var Console = function (element, options) {
 		var self = this;

 		this.$el = $(element);

    var content = $('<form><span>' + options.prompt + '</span>' + options.input + '</form>');

 		this.$el.append(content);

    var $form = this.$el.find('form');
    var $input = this.$el.find('input,textarea');

    var out = new ConcoleOut($form);

    this.$el.on('submit', 'form', function(evt) {
      evt.preventDefault();

      var $form  = $(evt.target);
      var text   = $input.val();

      $form.before('<pre class="cmd">' + options.prompt + '<span>' + text + '</span></pre>');
      $input.val('');

      try {
        options.processor(out, text);
      } catch(err) {
        out.error(err);
      }
    });

    $input.on('keydown', function(evt) {
      if (evt.ctrlKey && evt.keyCode == 13) {
        $form.submit(); 
      }
    });
 	}

  Console.defaults = {
    input : '<input type="text" autocomplete="off" name="cmd" spellcheck="false"></input>', 
    prompt: '&gt;',

    processor: function(out, cmd) {
      out.error('Unknown command: <b>' + cmd + '</b>');
    }
  }

  var old = $.fn.console;

  $.fn.console = function (option) {
    var self = this;
    return self.each(function () {
      var $this = $(this)
          , data = $this.data('console')
          , options = typeof option == 'object' && option;

      options = $.extend({}, Console.defaults, data, options);

      if (!data) $this.data('console', (data = new Console(this, options)));
    });
  }

  $.fn.console.Constructor = Console;

  $.fn.console.noConflict = function () {
    $.fn.console = old;
    return this;
  }

  function ConcoleOut(lastElem) {
    var self = this;
    
    self.append = function (text, className) {
      var lastEl = lastElem.prev();

      if(lastEl.is('pre.' + className)) { 
        // append to existent div (multiline answer)
        lastEl.append(text);
      } else {
        // append new answer div
        lastElem.before('<pre class="' + className + '">' + text + '</pre>');
      }
      return self;
    } 

    self.print = function(text) { 
      self.append(text, 'resp'); 
      return self;
    }

    self.println = function(text) { 
      self.print(text + '\n'); 
      return self;
    }

    self.error = function(text) {
      self.append(text, 'error'); 
      return self;
    }
  }

}(window.jQuery);