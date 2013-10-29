'use strict';

describe('Directive: directives', function () {

  // load the directive's module
  beforeEach(module('fifoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<directives></directives>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the directives directive');
  }));
});
