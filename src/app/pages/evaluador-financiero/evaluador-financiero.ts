import { Component, ChangeDetectorRef, OnInit, ApplicationRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvaluadorSidebar } from '../../components/evaluador-sidebar/evaluador-sidebar';

import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';
import { Services } from '../../services/services';
import { ClientsState, ClientsSidebarState } from '../../services/clients-state';

import { PricingService } from '../../services/pricing';
import { ProductCatalogService } from '../../services/product-catalog';
import { ClientSubsegmentService } from '../../services/subsegments';

import {
  PricingRequest,
  PricingResponse
} from '../../models/pricing';

import {ServicesFilters, ActiveService, ActiveClientGroup} from '../../models/services'

import { finalize } from 'rxjs/operators';
import { ProductCatalog } from '../../models/product-catalog';
import { Subsegment } from '../../models/subsegment';



@Component({
  selector: 'app-evaluador-financiero',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EvaluadorSidebar
  ],
  templateUrl: './evaluador-financiero.html',
  styleUrl: './evaluador-financiero.scss',
})

export class EvaluadorFinanciero implements OnInit {

  isFiltersExpanded = true;
  selectedDepartmentIds: any[] = [];
  selectedMunicipalityIds: any[] = [];

  servicesSearched = false;
  
  form!: FormGroup;
  departments: any[] = [];
  municipalities: any[] = [];
  products: ProductCatalog[] = [];
  subsegments_sel: Subsegment[] = [];


  services: ActiveService[] = [];
  clients: ActiveClientGroup[] = [];

  subsegments: string[] = [];
  capacityRanges: string[] = [];
  products_clients : string[] = []

  // selectedSubsegment = '';
  // selectedCapacityRange = '';
  // selectedProduct = '';

  loadingServices = false;
  showResults = false;
  loadingCalculation = false;
  pricingResult?: PricingResponse
  showFloor = false;
  selectedMunicipality: any = null;
  servicesError: string | null | undefined = null;
  sidebarState: ClientsSidebarState;


  constructor(
    private fb: FormBuilder,
    private departmentService : Department,
    private municipalityService : Municipality,
    private servicesService : Services,
    private pricingService : PricingService,
    private productCatalogService : ProductCatalogService,
    private clientSubsegmentService : ClientSubsegmentService,
    private clientsState : ClientsState,
  ){
    this.sidebarState = {
    ...this.clientsState.sidebar
  };
  }


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


    this.services = [...this.clientsState.services];
    if (this.services.length > 0) {
      this.buildClients();
    }
    this.servicesSearched = this.clientsState.servicesSearched;
    this.isFiltersExpanded = this.clientsState.isFiltersExpanded;

    this.sidebarState = {...this.clientsState.sidebar};
    this.selectedDepartmentIds = [...this.sidebarState.selectedDepartmentIds];
    this.selectedMunicipalityIds = [...this.sidebarState.selectedMunicipalityIds];

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
    this.municipalityService.getByDepartments([deptId])
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
      // this.selectedSubsegment = '';
      // this.selectedCapacityRange = '';
      // this.selectedProduct = '';
      this.subsegments = [];
      this.capacityRanges = [];
      this.products_clients = [];
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

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
    this.clientsState.isFiltersExpanded = this.isFiltersExpanded;
  }

  onDepartmentsChange(ids: any[]): void {
    this.selectedDepartmentIds = ids;
  }

  onMunicipalitiesChange(ids: any[]): void {
    this.selectedMunicipalityIds = ids;
  }

  onSidebarSearch(municipalityIds: any[]): void {
    if (municipalityIds.length === 0) {
      this.services = [];
      this.clients = [];
      this.servicesSearched = false;
      this.clientsState.services = [];
      this.clientsState.servicesSearched = false;
      return;
    }
    this.servicesSearched = true;
    this.loadingServices = true;
    this.servicesError = null;
    this.showResults = false;
    this.subsegments = [];
    this.capacityRanges = [];
    this.products_clients = [];

    const filters: ServicesFilters = {
      municipality: municipalityIds
    };

  this.servicesService
    .getByMunicipalities(filters)
    .pipe(
      finalize(() => {
        this.loadingServices = false;
      })
    )
    .subscribe({
      next: response => {
        if (response.success) 
        {
          this.services = response.data;
          console.log(this.services);
          this.buildClients();
          this.servicesSearched = true;
          this.clientsState.services = [...response.data];
          this.clientsState.servicesSearched = true;
        } 
        else 
        {
          this.services = [];
          this.servicesSearched = false;
          this.servicesError =
            response.message ??
            'No fue posible consultar los servicios.';
        }
      },
      error: err => {
        this.services = [];
        this.servicesError =
          err.error?.message ??
          'Error inesperado consultando servicios.';
      }
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

  onSidebarStateChange(state: ClientsSidebarState): void 
  {
    this.clientsState.sidebar = {...state};
    this.sidebarState = {...state};
    this.selectedDepartmentIds = [...state.selectedDepartmentIds];
    this.selectedMunicipalityIds = [...state.selectedMunicipalityIds];
  }

  buildClients(): void 
  {
    const grouped = new Map<string, ActiveService[]>();
    for (const service of this.services) {
      const nit = service.NIT;
      if (!grouped.has(nit)) {
        grouped.set(nit, []);
      }
      grouped.get(nit)!.push(service);
    }
    this.clients = Array.from(grouped.values()).map(services => new ActiveClientGroup(services));
    const expandedNits = this.clientsState.expandedClientNits;
    for (const client of this.clients) {
      client.expanded =
        expandedNits.includes(client.nit);
    }
  }
  
  toggleClient(client: ActiveClientGroup): void {
    client.expanded = !client.expanded;
    if (client.expanded) {
      if (!this.clientsState.expandedClientNits.includes(client.nit)) {
        this.clientsState.expandedClientNits = [
          ...this.clientsState.expandedClientNits,
          client.nit
        ];
      }
    } else {
      this.clientsState.expandedClientNits =
        this.clientsState.expandedClientNits.filter(
          nit => nit !== client.nit
        );
    }

  }

  
}
//
// EOF
//