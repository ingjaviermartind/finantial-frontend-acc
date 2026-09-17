import { TestBed } from '@angular/core/testing';

import { PricingSite } from './pricing-site';

describe('PricingSite', () => {
  let service: PricingSite;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PricingSite);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
