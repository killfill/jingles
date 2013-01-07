'use strict';

describe('Service: wiggle', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var wiggle;
  beforeEach(inject(function(_wiggle_) {
    wiggle = _wiggle_;
  }));

  it('should do something', function () {
    expect(!!wiggle).toBe(true);
  });

});
