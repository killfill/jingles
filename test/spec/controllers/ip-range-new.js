'use strict';

describe('Controller: IpRangeNewCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var IpRangeNewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IpRangeNewCtrl = $controller('IpRangeNewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
