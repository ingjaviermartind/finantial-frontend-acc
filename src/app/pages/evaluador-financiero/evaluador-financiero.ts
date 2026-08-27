import { Component, ChangeDetectorRef, OnInit, ApplicationRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';
import { Services } from '../../services/services';

import { PricingService } from '../../services/pricing';
import { ProductCatalogService } from '../../services/product-catalog';
import { ClientSubsegmentService } from '../../services/subsegments';

import {
  PricingRequest,
  PricingResponse
} from '../../models/pricing';

import { finalize } from 'rxjs/operators';
import { ProductCatalog } from '../../models/product-catalog';
import { Subsegment } from '../../models/subsegment';

@Component({
  selector: 'app-evaluador-financiero',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './evaluador-financiero.html',
  styleUrl: './evaluador-financiero.scss',
})

export class EvaluadorFinanciero implements OnInit {
  form!: FormGroup;
  departments: any[] = [];
  municipalities: any[] = [];
  products: ProductCatalog[] = [];
  subsegments_sel: Subsegment[] = [];
  services: any [] = [];
  filteredServices : any[] = [];

  subsegments: string[] = [];
  capacityRanges: string[] = [];

  selectedSubsegment = '';
  selectedCapacityRange = '';

  loadingServices = false;
  showResults = false;
  loadingCalculation = false;
  pricingResult?: PricingResponse
  showFloor = false;
  selectedMunicipality: any = null;
  servicesError: string | null | undefined = null;

  constructor(
    private fb: FormBuilder,
    private departmentService : Department,
    private municipalityService : Municipality,
    private servicesService : Services,
    private pricingService : PricingService,
    private productCatalogService : ProductCatalogService,
    private clientSubsegmentService : ClientSubsegmentService
  ){}


  ngOnInit(): void {

  this.form = this.fb.group({
    department: [''],
    municipality: [{ value: '', disabled: true }],
    product: ['', Validators.required],
    subsegment_sel: ['', Validators.required],
    bandwidth: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    contractTime: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    sensitivity: [null]
  });


  this.loadDepartments();
  this.loadProducts();
  this.loadSubsegments();
  this.form.get('municipality')!.reset();

  // Cambio de departamento
  this.form.get('department')!.valueChanges.subscribe(deptId => {
  this.selectedMunicipality = null;
  this.services = [];
  // this.form.get('product')!.setValue('');

  this.showResults = false;
  this.municipalities = [];
  this.form.get('municipality')!.reset();
  this.form.get('municipality')!.disable();
  if (!deptId) {
    return;
  }
  this.municipalityService.getByDepartment(deptId)
    .subscribe(data => {
      this.municipalities = [...data].sort(
        (a, b) => a.name.localeCompare(b.name)
      );
      this.form.get('municipality')!.enable();
    });
});


  // Cambio de municipio
  this.form.get('municipality')!.valueChanges.subscribe(municipalityId => {
    if (!municipalityId) {
      this.selectedMunicipality = null;
      this.services = [];
      // this.form.get('product')!.setValue('');
      return;
    }
    this.selectedMunicipality =
      this.municipalities.find(
        m => m.id === municipalityId
      );
    this.services = [];
    // this.form.get('product')!.setValue('');
    this.selectedSubsegment = '';
    this.selectedCapacityRange = '';
    this.subsegments = [];
    this.capacityRanges = [];
    this.servicesError = null;
    this.loadingServices = true;
    this.showResults = false;
    this.servicesService
      .getByMunicipality(municipalityId)
      .pipe(
        finalize(() => {
          this.loadingServices = false;
        })
      )
      .subscribe({
        next: response => {
          if (response.success) {
            this.services = response.data;
            this.selectedSubsegment = '';
            this.selectedCapacityRange = '';
            this.loadServiceFilters();
            this.applyServiceFilters();
            // console.log(response.data);
          } else {
            this.servicesError = response.message;
          }
        },

        error: err => {
          if (err.error?.code === 'DATABASE_ERROR') {
            this.servicesError =
              'Error de conexión con la base de datos. Intente nuevamente más tarde.';
            return;
          }
          if (err.error?.code === 'MUNICIPALITY_NOT_FOUND') {
            this.servicesError =
              'El municipio no existe o fue eliminado.';
            return;
          }
          this.servicesError =
            err.error?.message ??
            'Error inesperado consultando servicios.';
        }
      });

  });

}

  get canShowResults(): boolean {
    return !!this.selectedMunicipality &&
      this.form.controls['product'].valid &&
      this.form.controls['bandwidth'].valid &&
      this.form.controls['contractTime'].valid;
  }

  loadProducts(): void {
    this.productCatalogService.getAll()
      .subscribe({
        next: data => {
          this.products = data;
        },
        error: err => {
          console.error('Error cargando productos:', err);
        }
      });
  }
  loadSubsegments(): void {
    this.clientSubsegmentService.getAll()
      .subscribe({
        next: data => {
          this.subsegments_sel = data;
          // console.log(data)
        },
        error: err => {
          console.error('Error cargando subsegmentos:', err);
        }
      });
  }
  loadDepartments(){
    this.departmentService.getDepartments()
      .subscribe(data => {
        this.departments = [...data].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
      });
  }
  calculate() : void {
    if (this.form.invalid || !this.selectedMunicipality) {
      this.form.markAllAsTouched();
      return;
    }
    const request: PricingRequest = {
      municipality_id: this.selectedMunicipality.id,
      product_id: this.form.value.product,
      subsegment_id: this.form.value.subsegment_sel,
      capacity_mbps: this.form.value.bandwidth,
      contract_time: this.form.value.contractTime,
      initial_income: 0
    };

    // console.log('Pricing request:', request);

    this.showResults = false;
    this.pricingResult = undefined;
    this.loadingCalculation = true;
    this.pricingService.evaluate(request).pipe(
      finalize(() => {
        this.loadingCalculation = false;
      })
    ).subscribe({
      next: response => {
        this.pricingResult = response;
        this.showResults = true;
      },
      error: err => console.error(err)
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
  applyServiceFilters(): void {
    this.filteredServices = this.services.filter(service => {

      const matchesSubsegment =
        !this.selectedSubsegment ||
        service['subsegment'] === this.selectedSubsegment;

      const matchesCapacity =
        !this.selectedCapacityRange ||
        service['Rango Capacidad'] === this.selectedCapacityRange;

      return matchesSubsegment && matchesCapacity;
    });
  }

  loadServiceFilters(): void {
    this.subsegments = [
      ...new Set(
        this.services
          .map(service => service['subsegment'])
          .filter(value => value)
      )
    ].sort();

    this.capacityRanges = [
      ...new Set(
        this.services
          .map(service => service['Rango Capacidad'])
          .filter(value => value)
      )
    ];
  }
}
//
// EOF
//