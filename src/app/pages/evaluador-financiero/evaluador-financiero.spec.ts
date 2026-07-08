import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluadorFinanciero } from './evaluador-financiero';

describe('EvaluadorFinanciero', () => {
  let component: EvaluadorFinanciero;
  let fixture: ComponentFixture<EvaluadorFinanciero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluadorFinanciero],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluadorFinanciero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
