'use strict';

describe('Service: graphs', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var graphs;
  beforeEach(inject(function (_graphs_) {
    graphs = _graphs_;
  }));

  it('should do something', function () {
    expect(!!graphs).toBe(true);
  });

});
