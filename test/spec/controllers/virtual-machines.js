'use strict';

describe('Controller: Virtual-MachinesCtrl', function() {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var Virtual-MachinesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    Virtual-MachinesCtrl = $controller('Virtual-MachinesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
