import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionServicioSidebar } from './evaluacion-servicio-sidebar';

describe('EvaluacionServicioSidebar', () => {
  let component: EvaluacionServicioSidebar;
  let fixture: ComponentFixture<EvaluacionServicioSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionServicioSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluacionServicioSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
