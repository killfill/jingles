'use strict';

describe('Service: fifo', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var fifo;
  beforeEach(inject(function (_fifo_) {
    fifo = _fifo_;
  }));

  it('should do something', function () {
    expect(!!fifo).toBe(true);
  });

});
