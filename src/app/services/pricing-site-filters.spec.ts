import { TestBed } from '@angular/core/testing';

import { PricingSiteFilters } from './pricing-site-filters';

describe('PricingSiteFilters', () => {
  let service: PricingSiteFilters;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PricingSiteFilters);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
