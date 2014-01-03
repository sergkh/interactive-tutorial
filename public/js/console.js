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
      // submit form on Ctrl+Enter, especially usdefull for textarea
      if (evt.ctrlKey && evt.keyCode == 13) {
        $form.submit(); 
        return ;
      } 
    }).on('keyup', function(evt) {
      Console.performAutocompletion($input, options);
    });


 	}

  Console.defaults = {
    input : '<input type="text" autocomplete="off" name="cmd" spellcheck="false"></input>', 
    prompt: '&gt;',
    dictionary: ['SELECT', 'WHERE', 'INSERT', 'OR', 'AND', 'SORT BY', 'BETWEEN'],    
    typeaheadEnabled: true,
    autocompletionEnabled: true,
    autocompletionThreshold: 3,
    processor: function(out, cmd) {
      out.error('Unknown command: <b>' + cmd + '</b>');
    },

    autocomplete: function(text, lastWord, options) {
      var result = [];
      var words = options.dictionary;

      // simple dictionary based autocompletion
      for(var idx = 0; idx < words.length; idx++) {
        if(words[idx].indexOf(lastWord) == 0) result.push(words[idx]);  
      }

      return result;
    }
  }

  Console.performAutocompletion = function (input, opts) {
    if (!opts.typeaheadEnabled && !opts.autocompletionEnabled) return ;

    var text = input.val().trim();
    var lastWord = /[^\s,.\(\)\+\-\*\\]*$/.exec(text);

    if(lastWord == null || lastWord[0].length < opts.autocompletionThreshold) return ;

    var completions = opts.autocomplete(text, lastWord[0], opts);

    // typeahead
    if(options.typeaheadEnabled) {

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