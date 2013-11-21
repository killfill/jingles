'use strict';

describe('Controller: OrganizationNewCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var OrganizationNewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OrganizationNewCtrl = $controller('OrganizationNewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
