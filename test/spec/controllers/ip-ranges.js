'use strict';

describe('Controller: IpRangesCtrl', function () {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var IpRangesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IpRangesCtrl = $controller('IpRangesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
