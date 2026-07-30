import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';
import { Services } from '../../services/services';

import { PricingService } from '../../services/pricing';
import {
  PricingRequest,
  PricingResponse
} from '../../models/pricing';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-evaluador-financiero',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './evaluador-financiero.html',
  styleUrl: './evaluador-financiero.scss',
})

export class EvaluadorFinanciero implements OnInit {
  form!: FormGroup;
  departments: any[] = [];
  municipalities: any[] = [];
  services: any [] = [];
  loadingServices = false;
  showResults = false;
  loadingCalculation = false;
  pricingResult?: PricingResponse
  showFloor = false;
  selectedMunicipality: any = null;
  
  constructor(
    private fb: FormBuilder,
    private departmentService : Department,
    private municipalityService : Municipality,
    private servicesService : Services,
    private pricingService : PricingService,
    private cdr : ChangeDetectorRef
  ){}


  ngOnInit(): void {
    this.form = this.fb.group({
      department: [''],
      municipality: [{ value: '', disabled: true }],
      bandwidth: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      contractTime:[
        null,
        [
          Validators.required,
          Validators.min(1) 
        ]
      ],
      sensitivity: [null]
    });

    this.loadDepartments();

    // this.form.get('municipality')?.valueChanges.subscribe(value => {
    //   console.log('Municipio seleccionado:', value);
    // });

  }

  get canShowResults(): boolean {
    return !!this.selectedMunicipality &&
      this.form.controls['bandwidth'].valid &&
      this.form.controls['contractTime'].valid;
  }

  loadDepartments(){
    this.departmentService.getDepartments()
      .subscribe(data => {
        this.departments = [...data].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        this.cdr.detectChanges();
      });
  }

  onDepartmentChange(event : Event) {
    const deptId = (event.target as HTMLSelectElement).value;
    this.selectedMunicipality = null;
    this.form.patchValue({
      municipality:''
    });
    
    if(!deptId) {
      this.municipalities = [];
      this.form.get('municipality')?.disable();
      return;
    }

    this.municipalityService.getByDepartment(deptId)
      .subscribe(data => {
        this.municipalities = [...data].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        this.form.get('municipality')?.enable();
      });
  }

  onMunicipalityChange(event: Event) {
    const municipalityId =
      (event.target as HTMLSelectElement).value;
    this.selectedMunicipality =
      this.municipalities.find(
        m => m.id === municipalityId
      );
      
      this.services = []
      this.loadingServices = true;
      this.showResults = false;
      this.servicesService.getByMunicipality(municipalityId).pipe(
        finalize(() => {
          this.loadingServices = false;
          this.cdr.markForCheck(); // o detectChanges()
        })
      )
      .subscribe({
        next: data => {
          this.services = [...data];
        },
        error: err => {
          console.error(err);
        }
      });
  }

  calculate() : void {
    if (this.form.invalid || !this.selectedMunicipality) {
      this.form.markAllAsTouched();
      return;
    }
    const request: PricingRequest = {
      municipality_id: this.selectedMunicipality.id,
      capacity_mbps: this.form.value.bandwidth,
      contract_time: this.form.value.contractTime,
      initial_income: 0
    };
    this.showResults = false;
    this.pricingResult = undefined;
    this.loadingCalculation = true;
    this.pricingService.evaluate(request).pipe(
      finalize(() => {
        this.loadingCalculation = false;
        this.cdr.markForCheck();
      })
    )
    .subscribe({
      next: response => {
        this.pricingResult = response;
        this.showResults = true;
      },
      error: err => {
        console.error(err);
      }
    });
  }

  get displayedPrice() {
    if (!this.pricingResult) {
      return null;
    }

    return this.showFloor
      ? this.pricingResult.floor
      : this.pricingResult.suggested;
  }

  get canTogglePrice(): boolean {
    return !!this.pricingResult?.predicted.approved;
  }

  togglePrice(): void {
    this.showFloor = !this.showFloor;
  }

  get marketSourceLabel(): string {
    switch (this.pricingResult?.market_source) {
      case 'municipality':
        return 'Municipio';
      case 'department':
        return 'Departamento';
      case 'national':
        return 'Nacional';
      default:
        return '-';
    }
  }

  get historicalReference(): string {
    if (!this.pricingResult) {
      return '';
    }
    switch (this.pricingResult.market_source) {
      case 'municipality':
        return `Basado en ${this.pricingResult.market_sample} servicios del municipio.`;
      case 'department':
        return `Basado en ${this.pricingResult.market_sample} servicios del departamento.`;
      case 'national':
        return `Basado en ${this.pricingResult.market_sample} servicios a nivel nacional.`;
      default:
        return '';
    }
  }

}
//
// EOF
//