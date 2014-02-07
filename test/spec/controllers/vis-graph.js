'use strict';

describe('Controller: VisGraphCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var VisGraphCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    VisGraphCtrl = $controller('VisGraphCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
