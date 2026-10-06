import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionServicio } from './evaluacion-servicio';

describe('EvaluacionServicio', () => {
  let component: EvaluacionServicio;
  let fixture: ComponentFixture<EvaluacionServicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionServicio],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionServicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
