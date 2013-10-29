'use strict';

describe('Controller: NetworkCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var NetworkCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NetworkCtrl = $controller('NetworkCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
