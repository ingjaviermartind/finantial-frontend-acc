
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialVariableService } from '../../services/financial-variable';
import { FinancialVariable } from '../../models/financial-variable';
import { forkJoin, finalize } from 'rxjs';

interface FinancialArea {
  id: number;
  name: string;
}

@Component({
  selector: 'app-financial-variables',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './financial-variable.html',
  styleUrl: './financial-variable.scss'
})
export class FinancialVariables implements OnInit {

  variables: FinancialVariable[] = [];
  originalVariables: FinancialVariable[] = [];

  areas: FinancialArea[] = [];
  selectedAreaId: number | null = null;

  isLoading = true;
  isSaving = false;
  errorMessage = '';

  constructor(
    private financialVariableService: FinancialVariableService
  ) {}

  ngOnInit(): void {
    this.loadVariables();
  }

  loadVariables(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.financialVariableService
      .getVariables()
      .pipe(
        
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: response => {
          console.log('RESPUESTA COMPLETA:', response);
          this.variables = response;
          this.originalVariables = structuredClone(response);

          // Construir las áreas a partir de las variables recibidas.
          const areaMap = new Map<number, string>();
          console.log(
            'ÁREAS RECIBIDAS:',
            [...new Map(
              response.map(variable => [
                variable.area,
                variable.area_name
              ])
            )].map(([id, name]) => ({ id, name }))
          );
          response.forEach(variable => {
            areaMap.set(variable.area, variable.area_name);
          });

          this.areas = Array.from(areaMap, ([id, name]) => ({
            id,
            name
          })).sort((a, b) => a.name.localeCompare(b.name));

          if (
            this.selectedAreaId === null ||
            !this.areas.some(area => area.id === this.selectedAreaId)
          ) {
            this.selectedAreaId = this.areas[0]?.id ?? null;
          }
        },
        error: error => {
          console.error('Error cargando variables financieras:', error);
          this.errorMessage = 'No fue posible cargar las variables financieras.';
        }
      });
  }

  private readonly priorityKeys = [
    'VPN_MIN',
    'MARGIN_MIN',
    'PAYBACK_MAX_RATIO'
  ];

  get filteredVariables(): FinancialVariable[] {
    return [...this.variables]
    .filter(variable => variable.area === this.selectedAreaId)
    .sort((a, b) => {
      const indexA = this.priorityKeys.indexOf(a.key);
      const indexB = this.priorityKeys.indexOf(b.key);
      const priorityA = indexA === -1 ? Infinity : indexA;
      const priorityB = indexB === -1 ? Infinity : indexB;
      return priorityA - priorityB;
    });
  }

  selectArea(areaId: number): void {
    this.selectedAreaId = areaId;
  }

  hasChanges(): boolean {
    return this.getModifiedVariables().length > 0;
  }

  getModifiedVariables(): FinancialVariable[] {
    return this.variables.filter(variable => {
      const original = this.originalVariables.find(
        item => item.id === variable.id
      );

      return original?.value !== variable.value;
    });
  }

  isModified(variable: FinancialVariable): boolean {
    const original = this.originalVariables.find(
      item => item.id === variable.id
    );

    return original?.value !== variable.value;
  }

  saveChanges(): void {
    const invalid = this.variables.find(
      variable =>
        variable.value === null ||
        variable.value === undefined ||
        !Number.isFinite(Number(variable.value)) ||
        Number(variable.value) < 0
    );

    if (invalid) {
      this.errorMessage =
        `La variable "${invalid.name}" debe tener un valor numérico válido y no negativo.`;
      return;
    }

    const modifiedVariables = this.getModifiedVariables();

    if (modifiedVariables.length === 0 || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const requests = modifiedVariables.map(variable =>
      this.financialVariableService.updateVariable(
        variable.id,
        variable.value
      )
    );

    forkJoin(requests)
      .pipe(
        finalize(() => this.isSaving = false)
      )
      .subscribe({
        next: () => {
          this.originalVariables = structuredClone(this.variables);
          this.errorMessage = '';
        },
        error: error => {
          console.error('Error actualizando variables:', error);
          this.errorMessage =
            'Ocurrió un error al actualizar las variables. Verifica los cambios e intenta nuevamente.';
        }
      });
  }

  cancelChanges(): void {
    this.variables = structuredClone(this.originalVariables);
    this.errorMessage = '';
  }

}
