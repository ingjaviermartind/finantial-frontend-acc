import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainFunnelTracker } from './main-funnel-tracker';

describe('MainFunnelTracker', () => {
  let component: MainFunnelTracker;
  let fixture: ComponentFixture<MainFunnelTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainFunnelTracker],
    }).compileComponents();

    fixture = TestBed.createComponent(MainFunnelTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
