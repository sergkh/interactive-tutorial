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

      // use tab 
      if(evt.keyCode === 9) { 
        var field = $input[0];

        if(options.typeaheadEnabled && 
          field.selectionStart && 
          field.selectionStart != field.selectionEnd) {
          field.selectionStart = field.selectionEnd;
          Console.insertAtCaret(field, ' ');
          field.selectionStart = field.selectionEnd;
          evt.preventDefault();
        }
      }
    }).on('keyup', function(evt) {
      if(evt.keyCode > 47 && evt.keyCode < 112) {
        Console.performAutocompletion($input, options);
      }
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

    var lastWordMatch = /[^\s,.\(\)\+\-\*\\]*$/.exec(text);
    if(lastWordMatch == null || lastWordMatch[0].length < opts.autocompletionThreshold) return ;
    var lastWord = lastWordMatch[0];

    var completions = opts.autocomplete(text, lastWord, opts);

    if(completions.length == 0) return ;

    // typeahead
    if(opts.typeaheadEnabled) {
      Console.insertAtCaret(input[0], completions[0].substring(lastWord.length));
    }  
  }

  Console.insertAtCaret = function(field, text) {
    if (document.selection) {
        // IE
        field.focus();
        var sel = document.selection.createRange();
        sel.text = text;
        field.focus();
    } else if (field.selectionStart || field.selectionStart === 0) {
        var startPos = field.selectionStart;
        var endPos = field.selectionEnd;
        var scrollTop = field.scrollTop;
        field.value = field.value.substring(0, startPos) + text + field.value.substring(endPos, field.value.length);
        field.focus();
        field.selectionStart = startPos;
        field.selectionEnd = startPos + text.length;
        field.scrollTop = scrollTop;
    } else {
        field.value += text;
        field.focus();
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