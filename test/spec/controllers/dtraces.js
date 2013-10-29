'use strict';

describe('Controller: DtracesCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var DtracesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DtracesCtrl = $controller('DtracesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
