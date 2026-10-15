import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunnelTrackerNavbar } from './funnel-tracker-navbar';

describe('FunnelTrackerNavbar', () => {
  let component: FunnelTrackerNavbar;
  let fixture: ComponentFixture<FunnelTrackerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunnelTrackerNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(FunnelTrackerNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
