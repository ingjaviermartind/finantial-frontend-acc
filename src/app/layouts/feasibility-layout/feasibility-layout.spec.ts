import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeasibilityLayout } from './feasibility-layout';

describe('FeasibilityLayout', () => {
  let component: FeasibilityLayout;
  let fixture: ComponentFixture<FeasibilityLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeasibilityLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(FeasibilityLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
