'use strict';

describe('Controller: HypervisorsCtrl', function() {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var HypervisorsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    HypervisorsCtrl = $controller('HypervisorsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
