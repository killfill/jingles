'use strict';

describe('Controller: NetworksCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var NetworksCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NetworksCtrl = $controller('NetworksCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
