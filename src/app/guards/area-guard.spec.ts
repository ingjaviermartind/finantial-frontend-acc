import { TestBed } from '@angular/core/testing';
import { areaGuard } from './area-guard';

describe('areaGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });
  it('should be created', () => {
    const guard = areaGuard('pricing');
    expect(guard).toBeTruthy();

  });
});
