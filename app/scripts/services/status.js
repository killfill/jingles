'use strict';

angular.module('fifoApp')
  .factory('status', function () {

    return {
      success: Alertify.log.success, 
      info: Alertify.log.info,
      error: Alertify.log.error,
      prompt: function(text, cb, errCb) {
        Alertify.dialog.prompt(text, function(userInput) {
            if (userInput == '') return;
            cb(userInput);
        }, errCb)
    }
    };

  });
