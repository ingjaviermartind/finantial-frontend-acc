import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingSitesSidebar } from './pricing-sites-sidebar';

describe('PricingSitesSidebar', () => {
  let component: PricingSitesSidebar;
  let fixture: ComponentFixture<PricingSitesSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingSitesSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingSitesSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
