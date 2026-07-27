import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialVariableService } from '../../services/financial-variable';
import { FinancialVariable } from '../../models/financial-variable';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-financial-variables',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './financial-variables.html',
  styleUrl: './financial-variables.scss'
})
export class FinancialVariables {

  variables: FinancialVariable[] = [];
  originalVariables: FinancialVariable[] = [];
  isLoading = true;

  constructor(
    private financialVariableService: FinancialVariableService,
    private cdr : ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loadVariables();
    
  }

  loadVariables(): void {

    this.isLoading = true;

    this.financialVariableService
      .getVariables()
      .subscribe({

        next: (response) => {

          this.variables = response;
          this.originalVariables = structuredClone(response);
          this.isLoading = false;
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(error);
          this.isLoading = false;
          this.cdr.detectChanges();

        }

      });

  }


  hasChanges(): boolean {
    return this.variables.some(variable => {
      const original = this.originalVariables.find(
        v => v.id === variable.id
      );
      return original?.value !== variable.value;
    });

  }

  getModifiedVariables(): FinancialVariable[] {
    return this.variables.filter(variable => {
      const original = this.originalVariables.find(
        v => v.id === variable.id
      );
      return original?.value !== variable.value;
    });
  }

  saveChanges(): void {
    const invalid = this.variables.find(v => v.value < 0);
    if (invalid) {
      alert(`La variable "${invalid.name}" no puede tener un valor negativo.`);
      return;
    }
    const modifiedVariables =
        this.getModifiedVariables();
    if(modifiedVariables.length === 0){
        return;
    }
    const requests = modifiedVariables.map(variable =>
        this.financialVariableService.updateVariable(
            variable.id,
            variable.value
        )
    );
    forkJoin(requests).subscribe({
        next: () => {
            this.originalVariables =
                structuredClone(this.variables);
            alert(
                'Variables actualizadas correctamente.'
            );
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error(error);
            alert(
                'Ocurrió un error al actualizar las variables.'
            );
        }
    });
  }

  cancelChanges(): void {
    this.variables =
      structuredClone(this.originalVariables);
  }

  isModified(variable: FinancialVariable): boolean {
    const original = this.originalVariables.find(
      v => v.id === variable.id
    );
    return original?.value !== variable.value;
  }

 

}