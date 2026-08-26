import { TestBed } from '@angular/core/testing';

import { Subsegments } from './subsegments';

describe('Subsegments', () => {
  let service: Subsegments;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Subsegments);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
