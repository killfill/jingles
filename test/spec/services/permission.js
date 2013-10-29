'use strict';

describe('Service: permission', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var permission;
  beforeEach(inject(function (_permission_) {
    permission = _permission_;
  }));

  it('should do something', function () {
    expect(!!permission).toBe(true);
  });

});
