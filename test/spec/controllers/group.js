'use strict';

describe('Controller: GroupCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var GroupCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GroupCtrl = $controller('GroupCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
