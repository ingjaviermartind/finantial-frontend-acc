import { TestBed } from '@angular/core/testing';

import { Versions } from './versions';

describe('Versions', () => {
  let service: Versions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Versions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
