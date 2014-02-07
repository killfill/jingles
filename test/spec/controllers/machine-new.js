'use strict';

describe('Controller: MachineNewCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var MachineNewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MachineNewCtrl = $controller('MachineNewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
