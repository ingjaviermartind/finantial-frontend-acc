import { Component } from '@angular/core';
import { EvaluacionServicioSidebar } from '../../components/evaluacion-servicio-sidebar/evaluacion-servicio-sidebar';

@Component({
  selector: 'app-evaluacion-servicio',
  imports: [
    EvaluacionServicioSidebar
  ],
  standalone: true,
  templateUrl: './evaluacion-servicio.html',
  styleUrl: './evaluacion-servicio.scss',
})
export class EvaluacionServicio {
  isFiltersExpanded = true;

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }
  evaluateService(): void {
    // aquí irá la lógica de evaluación
  }
}