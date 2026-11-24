import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Evaluator } from './evaluator';

describe('EvaluacionServicio', () => {
  let component: Evaluator;
  let fixture: ComponentFixture<Evaluator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Evaluator],
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
