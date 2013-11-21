'use strict';

describe('Service: datasetsat', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var datasetsat;
  beforeEach(inject(function (_datasetsat_) {
    datasetsat = _datasetsat_;
  }));

  it('should do something', function () {
    expect(!!datasetsat).toBe(true);
  });

});
