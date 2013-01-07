'use strict';

describe('Controller: UsersCtrl', function() {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var UsersCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    UsersCtrl = $controller('UsersCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
