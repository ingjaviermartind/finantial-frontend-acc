import { TestBed } from '@angular/core/testing';

import { FinancialVariable } from './financial-variable';

describe('FinancialVariable', () => {
  let service: FinancialVariable;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialVariable);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
