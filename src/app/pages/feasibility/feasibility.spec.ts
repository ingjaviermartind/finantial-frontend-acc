import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Feasibility } from './feasibility';

describe('Feasibility', () => {
  let component: Feasibility;
  let fixture: ComponentFixture<Feasibility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feasibility],
    }).compileComponents();

    fixture = TestBed.createComponent(Feasibility);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
