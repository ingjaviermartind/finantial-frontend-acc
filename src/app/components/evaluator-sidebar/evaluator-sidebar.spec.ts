import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatorSidebar } from './evaluator-sidebar';

describe('EvaluacionServicioSidebar', () => {
  let component: EvaluatorSidebar;
  let fixture: ComponentFixture<EvaluatorSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluatorSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluatorSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
