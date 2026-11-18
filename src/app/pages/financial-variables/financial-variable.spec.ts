import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialVariables } from './financial-variable';

describe('FinancialVariables', () => {
  let component: FinancialVariables;
  let fixture: ComponentFixture<FinancialVariables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialVariables],
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialVariables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
