'use strict';

describe('Service: vm', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var vm;
  beforeEach(inject(function (_vm_) {
    vm = _vm_;
  }));

  it('should do something', function () {
    expect(!!vm).toBe(true);
  });

});
