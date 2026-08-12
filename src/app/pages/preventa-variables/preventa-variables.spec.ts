import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreventaVariables } from './preventa-variables';

describe('PreventaVariables', () => {
  let component: PreventaVariables;
  let fixture: ComponentFixture<PreventaVariables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreventaVariables],
    }).compileComponents();

    fixture = TestBed.createComponent(PreventaVariables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
