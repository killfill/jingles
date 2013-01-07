'use strict';

describe('Controller: GroupsCtrl', function() {

  // load the controller's module
  beforeEach(module('fifoApp'));

  var GroupsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    scope = {};
    GroupsCtrl = $controller('GroupsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
