'use strict';

describe('Controller: PackageNewCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var PackageNewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PackageNewCtrl = $controller('PackageNewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
