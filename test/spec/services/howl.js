'use strict';

describe('Service: howl', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var howl;
  beforeEach(inject(function (_howl_) {
    howl = _howl_;
  }));

  it('should do something', function () {
    expect(!!howl).toBe(true);
  });

});
