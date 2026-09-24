import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluadorSidebar } from './evaluador-sidebar';

describe('EvaluadorSidebar', () => {
  let component: EvaluadorSidebar;
  let fixture: ComponentFixture<EvaluadorSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluadorSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluadorSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
