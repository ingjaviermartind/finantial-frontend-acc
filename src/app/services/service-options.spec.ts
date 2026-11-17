import { TestBed } from '@angular/core/testing';

import { ServiceOptions } from './service-options';

describe('ServiceOptions', () => {
  let service: ServiceOptions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceOptions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
