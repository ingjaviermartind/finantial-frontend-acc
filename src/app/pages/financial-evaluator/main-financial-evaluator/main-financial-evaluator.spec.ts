import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainFinancialEvaluator } from './main-financial-evaluator';

describe('MainFinancialEvaluator', () => {
  let component: MainFinancialEvaluator;
  let fixture: ComponentFixture<MainFinancialEvaluator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainFinancialEvaluator],
    }).compileComponents();

    fixture = TestBed.createComponent(MainFinancialEvaluator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
