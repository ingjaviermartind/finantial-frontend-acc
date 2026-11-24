import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatorNavbar } from './evaluator-navbar';

describe('EvaluatorNavbar', () => {
  let component: EvaluatorNavbar;
  let fixture: ComponentFixture<EvaluatorNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluatorNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluatorNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
