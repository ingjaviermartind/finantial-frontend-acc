import { Component, ChangeDetectorRef, OnInit, ApplicationRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientSidebar } from '../../components/client-sidebar/client-sidebar';

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

import {ServicesFilters, ActiveService, ActiveClientGroup, ServicesMetrics} from '../../models/services'

import { finalize } from 'rxjs/operators';
import { ProductCatalog } from '../../models/product-catalog';
import { Subsegment } from '../../models/subsegment';

type SortColumn =
    | 'cliente'
    | 'mrc'
    | 'ser'
    | 'ubicacion'
    | 'producto'
    | 'capacidad'
    | 'tarifa';
  type SortDirection = 'asc' | 'desc';

  

@Component({
  selector: 'app-evaluador-financiero',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClientSidebar
  ],
  templateUrl: './client.html',
  styleUrl: './client.scss',
})

export class Client implements OnInit {

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
  metrics: ServicesMetrics = {
    total_services: 0,
    unique_clients: 0,
    total_mbps: 0,
    total_mrc: 0,
    mrc_svas: 0
  };
  // clients: ActiveClientGroup[] = [];

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

  protected readonly Number = Number;

  
  sortColumn: SortColumn = 'cliente';
  sortDirection: SortDirection = 'asc';

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


    // this.services = [...this.clientsState.services];
    // if (this.services.length > 0) {
    //   this.buildClients();
    // }
    this.services = [...this.clientsState.services];
    this.metrics = { ...this.clientsState.metrics };
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
      this.metrics = {
        total_services: 0,
        unique_clients: 0,
        total_mbps: 0,
        total_mrc: 0,
        mrc_svas: 0
      };
      this.clientsState.metrics = { ...this.metrics };
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

  onSidebarSearch(filters: ServicesFilters): void {
    const hasDepartments = !!filters.department?.length;
    const hasMunicipalities = !!filters.municipality?.length;
    const hasClients = !!filters.client?.length;
    const hasSubsegment = !!filters.subsegment?.length;
    // Si no hay filtros de búsqueda, limpiar resultados
    if (!hasMunicipalities && !hasClients && !hasDepartments && !hasSubsegment) {
      this.services = [];
      // this.clients = [];
      this.servicesSearched = false;
      this.clientsState.services = [];
      this.clientsState.servicesSearched = false;
      this.metrics = {
        total_services: 0,
        unique_clients: 0,
        total_mbps: 0,
        total_mrc: 0,
        mrc_svas: 0
      };
      this.clientsState.metrics = { ...this.metrics };
      return;
    }
    this.metrics = {
      total_services: 0,
      unique_clients: 0,
      total_mbps: 0,
      total_mrc: 0,
      mrc_svas: 0
    };
    this.clientsState.metrics = { ...this.metrics };
    this.servicesSearched = true;
    this.loadingServices = true;
    this.servicesError = null;
    this.showResults = false;
    this.subsegments = [];
    this.capacityRanges = [];
    this.products_clients = [];
    this.servicesService
      .getByMunicipalities(filters)
      .pipe(
        finalize(() => {
          this.loadingServices = false;
        })
      )
      .subscribe({
        next: response => {
          if (response.success) {
            // console.log(response.data);
            // console.log(response.metrics);
            this.metrics = response.metrics;
            this.clientsState.metrics = { ...response.metrics };
            this.services = response.data;
            // this.buildClients();
            this.servicesSearched = true;
            this.clientsState.services = [...response.data];
            this.clientsState.servicesSearched = true;
          } else {
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

  // get marketSourceLabel(): string {
  //   switch (this.pricingResult?.market_source) {
  //     case 'municipality':
  //       return 'Municipio';
  //     case 'department':
  //       return 'Departamento';
  //     case 'national':
  //       return 'Nacional';
  //     default:
  //       return '-';
  //   }
  // }

  // get historicalReference(): string {
  //   if (!this.pricingResult) {
  //     return '';
  //   }
  //   switch (this.pricingResult.market_source) {
  //     case 'municipality':
  //       return `Basado en ${this.pricingResult.market_sample} servicios del municipio.`;
  //     case 'department':
  //       return `Basado en ${this.pricingResult.market_sample} servicios del departamento.`;
  //     case 'national':
  //       return `Basado en ${this.pricingResult.market_sample} servicios a nivel nacional.`;
  //     default:
  //       return '';
  //   }
  // }

  onSidebarStateChange(state: ClientsSidebarState): void 
  {
    this.clientsState.sidebar = {...state};
    this.sidebarState = {...state};
    this.selectedDepartmentIds = [...state.selectedDepartmentIds];
    this.selectedMunicipalityIds = [...state.selectedMunicipalityIds];
  }

  // buildClients(): void 
  // {
  //   const grouped = new Map<string, ActiveService[]>();
  //   for (const service of this.services) {
  //     const nit = service.nit;
  //     if (!grouped.has(nit)) {
  //       grouped.set(nit, []);
  //     }
  //     grouped.get(nit)!.push(service);
  //   }
  //   this.clients = Array.from(grouped.values()).map(services => new ActiveClientGroup(services));
  //   const expandedNits = this.clientsState.expandedClientNits;
  //   for (const client of this.clients) {
  //     client.expanded =
  //       expandedNits.includes(client.nit);
  //   }
  // }
  
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


  getServiceCount(nit: string): number {
    return this.services.filter(service => service.nit === nit).length;
  }

  get sortedServices(): ActiveService[] {
    return [...this.services].sort((a, b) => {
      let result = 0;

      switch (this.sortColumn) {
        case 'cliente':
          result = (a.razon_social ?? '').localeCompare(
            b.razon_social ?? '',
            'es',
            { sensitivity: 'base' }
          );
          break;

        case 'mrc':
          result = (a.tarifa_total_cliente ?? 0) -
                  (b.tarifa_total_cliente ?? 0);
          break;

        case 'ser':
          result = (a.ser ?? '').localeCompare(
            b.ser ?? '',
            'es',
            { numeric: true, sensitivity: 'base' }
          );
          break;

        case 'ubicacion':
          result = (a.departamento ?? '').localeCompare(
            b.departamento ?? '',
            'es',
            { sensitivity: 'base' }
          );

          if (result === 0) {
            result = (a.municipio ?? '').localeCompare(
              b.municipio ?? '',
              'es',
              { sensitivity: 'base' }
            );
          }
          break;

        case 'producto':
          result = (a.producto ?? '').localeCompare(
            b.producto ?? '',
            'es',
            { sensitivity: 'base' }
          );
          break;

        case 'capacidad':
          result = (a.capacidadbps ?? 0) - (b.capacidadbps ?? 0);
          break;

        case 'tarifa':
          result = (a.tarifa ?? 0) - (b.tarifa ?? 0);
          break;
      }

      return this.sortDirection === 'asc' ? result : -result;
    });
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortIndicator(column: SortColumn): string {
    if (this.sortColumn !== column) {
      return '↕';
    }

    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
  
}
//
// EOF
//