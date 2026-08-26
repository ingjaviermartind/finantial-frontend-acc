import { TestBed } from '@angular/core/testing';

import { ProductCatalog } from './product-catalog';

describe('ProductCatalog', () => {
  let service: ProductCatalog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductCatalog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
