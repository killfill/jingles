'use strict';

angular.module('fifoApp')
  .factory('status', function () {

    return {
      success: alertify.log.success, 
      info: alertify.log.info,
      error: alertify.log.error,
      prompt: function(text, cb, errCb) {
        alertify.dialog.prompt(text, function(userInput) {
            if (userInput == '') return;
            cb(userInput);
        }, errCb)
    }
    };

  });
