import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';

import { Observable, of, catchError, map, tap } from 'rxjs';

import { FormsModule } from '@angular/forms';

import { ClientsState } from '../../services/clients-state';
import { ActiveService, SelectedDaneLocation } from '../../models/services';

import { ClientSubsegmentService } from '../../services/subsegments';
import { Subsegment } from '../../models/subsegment';

import { ProductCatalogService } from '../../services/product-catalog';
import { ProductCatalog } from '../../models/product-catalog';
import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';
import { department, municipality } from '../../models/location';
import {
  PricingRequest,
  PricingResponse
} from '../../models/pricing';

@Component({
  selector: 'app-evaluator-sidebar',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './evaluator-sidebar.html',
  styleUrl: './evaluator-sidebar.scss',
})
export class EvaluatorSidebar implements OnInit {

  @Input() isExpanded = true;
  @Output() evaluate = new EventEmitter<PricingRequest>();
  @Output() selectedDaneChange = new EventEmitter<municipality | null>();

  serviceSearch = '';

  subsegments: Subsegment[] = [];
  products: ProductCatalog[] = [];
  departments: department[] = [];
  municipalities: municipality[] = [];
  selectedDepartmentId : string | null = null;
  selectedMunicipalityId : string | null = null;

  // capacityMbps: number | null = null;
  // contractTime: number | null = null;
  // initialCapex = 0;

  constructor(
    private clientsState: ClientsState,
    private clientSubsegmentService: ClientSubsegmentService,
    private productCatalogService : ProductCatalogService,
    private departmentService : Department,
    private municipalityService : Municipality
  ) {}

  ngOnInit(): void {
    this.selectedDepartmentId = this.clientsState.selectedEvaluationDepartmentId;
    this.selectedMunicipalityId = this.clientsState.selectedEvaluationMunicipalityId;
    this.capacityMbps = this.clientsState.evaluationCapacityMbps;
    this.contractTime = this.clientsState.evaluationContractTime;
    this.initialCapex = this.clientsState.evaluationInitialCapex;
    this.clientSubsegmentService
      .getAll()
      .subscribe({
        next: data => {
          this.subsegments = [...data].sort(
            (a, b) => a.name.localeCompare(b.name)
          );
        },
        error: err => {
          console.error(
            'Error cargando subsegmentos:',
            err
          );
        }
      });
    this.productCatalogService
    .getAll()
    .subscribe({
      next: data => {
        this.products = [...data].sort(
          (a, b) => a.product.localeCompare(b.product)
        );
      },
      error: err => {
        console.error(
          'Error cargando productos:',
          err
        );
      }
    });

    this.departmentService
    .getDepartments()
    .subscribe({
      next: data => {
        this.departments = [...data].sort(
          (a, b) => a.name.localeCompare(b.name)
        );

        if (this.selectedDepartmentId) {
          this.loadMunicipalities(this.selectedDepartmentId).subscribe();
        }
      },
      error: err => {
        console.error(
          'Error cargando departamentos:',
          err
        );
      }
    });

  }


  loadMunicipalities(departmentId: string): Observable<municipality[]> {
    return this.municipalityService
      .getByDepartments([departmentId])
      .pipe(
        map(data =>
          [...data].sort((a, b) => a.name.localeCompare(b.name))
        ),
        tap(data => {
          this.municipalities = data;
        }),
        catchError(err => {
          console.error('Error cargando municipios:', err);
          this.municipalities = [];
          return of([]);
        })
      );
  }

  onDepartmentChange(departmentId: string) : void {
    this.selectedDepartmentId = departmentId || null;
    this.selectedMunicipalityId = null;
    this.municipalities = [];
    this.clientsState.selectedEvaluationDepartmentId = this.selectedDepartmentId;
    this.clientsState.selectedEvaluationMunicipalityId = null;
    this.clientsState.selectedService = null;
    this.selectedDaneChange.emit(null);
    if (this.selectedDepartmentId) 
      this.loadMunicipalities(this.selectedDepartmentId).subscribe();
  }

  onMunicipalityChange(municipalityId: string | null): void {
    this.selectedMunicipalityId = municipalityId || null;
    this.clientsState.selectedEvaluationMunicipalityId = this.selectedMunicipalityId;
    this.clientsState.selectedService = null;
    this.emitSelectedDaneMunicipality();
  }

  private normalizeDane(value: unknown): string {
    return String(value ?? '').trim().padStart(5, '0');
  }

  private emitSelectedDaneMunicipality(): void {
    const SelectedMunicipality = this.municipalities.find(
      m => String(m.id) === String(this.selectedMunicipalityId)
    );
    this.selectedDaneChange.emit(SelectedMunicipality);
  }

  get services(): ActiveService[] {
    return this.clientsState.services;
  }


  get selectedService(): ActiveService | null {
    return this.clientsState.selectedService;
  }


  get selectedSubsegment(): string | null {
    return this.clientsState.selectedSubsegment;
  }

  get selectedProduct(): string | null {
    return this.clientsState.selectedProduct;
  }

  onProductChange(product: string): void {
    this.clientsState.selectedProduct = product || null;
  }

  get filteredServices(): ActiveService[] {
    const search = this.serviceSearch.trim().toLowerCase();
    if (!search) 
      return this.services;
    return this.services.filter(service =>
      service.SER.toLowerCase().includes(search) ||
      service['Razón Social']
        .toLowerCase()
        .includes(search) ||
      service.Producto
        .toLowerCase()
        .includes(search) ||
      service.Municipio
        .toLowerCase()
        .includes(search)
    );
  }


  selectService(service: ActiveService): void {
    this.clientsState.selectedService = service;
    this.clientsState.selectedSubsegment = service.Subsegmento?.trim() || null;
    this.clientsState.selectedProduct = service.Producto?.trim() || null;
    this.capacityMbps = service.CAPACIDADBPS ?? null;
    const department = this.departments.find(
      d => d.name === service.Departamento
    );
    if (!department) {
      this.selectedDepartmentId = null;
      this.selectedMunicipalityId = null;
      this.municipalities = [];
      this.clientsState.selectedEvaluationDepartmentId = null;
      this.clientsState.selectedEvaluationMunicipalityId = null;
      this.selectedDaneChange.emit(null);
      return;
    }
    this.selectedDepartmentId = department.id;
    this.selectedMunicipalityId = null;
    this.clientsState.selectedEvaluationDepartmentId = department.id;
    this.clientsState.selectedEvaluationMunicipalityId = null;
    this.loadMunicipalities(department.id).subscribe(municipalities => {
      const serviceDane = this.normalizeDane(service['Codigo DANE']);
      const municipality = municipalities.find(
        m => this.normalizeDane(m.dane) === serviceDane
      );
      if (!municipality) {
        this.selectedMunicipalityId = null;
        this.clientsState.selectedEvaluationMunicipalityId = null;
        this.selectedDaneChange.emit(null);
        console.warn(`No se encontró el municipio con DANE ${serviceDane}`);
        return;
      }
      this.selectedMunicipalityId = municipality.id;
      this.clientsState.selectedEvaluationMunicipalityId = municipality.id;
      this.emitSelectedDaneMunicipality();
    });
  }

  onSubsegmentChange(subsegment: string): void {
    this.clientsState.selectedSubsegment =
      subsegment || null;
  }

  evaluateService(): void {
    if (
      !this.selectedMunicipalityId ||
      !this.selectedProduct ||
      !this.selectedSubsegment ||
      !this.capacityMbps ||
      !this.contractTime
    ) {
      return;
    }
    const selectedProduct = this.products.find(product => product.product === this.selectedProduct);
    const selectedSubsegment = this.subsegments.find(subsegment => subsegment.name === this.selectedSubsegment);
    if (!selectedProduct || !selectedSubsegment) 
      return;
    
    const request: PricingRequest = {
      municipality_id: this.selectedMunicipalityId,
      product_id: selectedProduct.id,
      subsegment_id: selectedSubsegment.id,
      capacity_mbps: this.capacityMbps,
      contract_time: this.contractTime,
      initial_capex: this.initialCapex,
      initial_income: 0
    };
    this.evaluate.emit(request);
  }

  clearSelection(): void {
    this.serviceSearch = '';
    this.clientsState.selectedService = null;
    this.clientsState.selectedSubsegment = null;
    this.clientsState.selectedProduct = null;
    this.clientsState.selectedEvaluationDepartmentId = null;
    this.clientsState.selectedEvaluationMunicipalityId = null;
    this.selectedDepartmentId = null;
    this.selectedMunicipalityId = null;
    this.municipalities = [];
    this.capacityMbps = null;
    this.contractTime = null;
    this.initialCapex = 0;
    this.selectedDaneChange.emit(null);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedService ||
      this.selectedSubsegment ||
      this.selectedProduct ||
      this.selectedDepartmentId ||
      this.selectedMunicipalityId ||
      this.capacityMbps !== null ||
      this.contractTime !== null ||
      this.initialCapex !== 0 ||
      this.serviceSearch
    );
  }

  get capacityMbps(): number | null {
    return this.clientsState.evaluationCapacityMbps;
  }

  set capacityMbps(value: number | null) {
    this.clientsState.evaluationCapacityMbps = value;
  }

  get contractTime(): number | null {
    return this.clientsState.evaluationContractTime;
  }

  set contractTime(value: number | null) {
    this.clientsState.evaluationContractTime = value;
  }

  get initialCapex(): number {
    return this.clientsState.evaluationInitialCapex;
  }

  set initialCapex(value: number) {
    this.clientsState.evaluationInitialCapex = value;
  }
}