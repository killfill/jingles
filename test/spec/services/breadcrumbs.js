'use strict';

describe('Service: breadcrumbs', function () {

  // load the service's module
  beforeEach(module('fifoApp'));

  // instantiate service
  var breadcrumbs;
  beforeEach(inject(function (_breadcrumbs_) {
    breadcrumbs = _breadcrumbs_;
  }));

  it('should do something', function () {
    expect(!!breadcrumbs).toBe(true);
  });

});
