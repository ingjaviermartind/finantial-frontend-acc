import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingSites } from './pricing-sites';

describe('PricingSites', () => {
  let component: PricingSites;
  let fixture: ComponentFixture<PricingSites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingSites],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingSites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
