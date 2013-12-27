'use strict';

angular.module('fifoApp')
  .factory('status', function (auth) {
    return {
      success: function(s) {
        alertify.success(s)
      },
      info: function(s) {
        alertify.log(s)
      },
      error: function(s) {
        alertify.error(s)
      },
      prompt: function(text, cb, errCb) {
        alertify.prompt(text, function(ok, userInput) {
            if (userInput == '' || !ok) return;
            cb(userInput);
        }, errCb)
    }
    };

  });
