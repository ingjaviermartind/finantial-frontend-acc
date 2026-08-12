import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeasibilitySidebar } from './feasibility-sidebar';

describe('FeasibilitySidebar', () => {
  let component: FeasibilitySidebar;
  let fixture: ComponentFixture<FeasibilitySidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeasibilitySidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(FeasibilitySidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
