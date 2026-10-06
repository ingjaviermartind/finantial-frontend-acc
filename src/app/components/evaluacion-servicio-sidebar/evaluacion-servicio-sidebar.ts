import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ClientsState } from '../../services/clients-state';
import { ActiveService } from '../../models/services';

import { ClientSubsegmentService } from '../../services/subsegments';
import { Subsegment } from '../../models/subsegment';

import { ProductCatalogService } from '../../services/product-catalog';
import { ProductCatalog } from '../../models/product-catalog';
import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';

@Component({
  selector: 'app-evaluacion-servicio-sidebar',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './evaluacion-servicio-sidebar.html',
  styleUrl: './evaluacion-servicio-sidebar.scss',
})
export class EvaluacionServicioSidebar implements OnInit {

  @Input() isExpanded = true;
  @Output() evaluate = new EventEmitter<void>();

  serviceSearch = '';

  subsegments: Subsegment[] = [];
  products: ProductCatalog[] = [];
  departments: any[] = [];
  municipalities: any[] = [];
  selectedDepartmentId : string | null = null;
  selectedMunicipalityId : string | null = null;

  capacityMbps: number | null = null;
  contractTime: number | null = null;
  initialCapex = 0;

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
          this.loadMunicipalities(
            this.selectedDepartmentId
          );
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


  loadMunicipalities( departmentId: string, municipalityName?: string, municipalityDane?: string): void {
    this.municipalityService
      .getByDepartments([departmentId])
      .subscribe({
        next: data => {

          this.municipalities = [...data].sort(
            (a, b) => a.name.localeCompare(b.name)
          );

          if (municipalityName || municipalityDane) {

            const municipality =
              this.municipalities.find(m => {

                const sameDane =
                  municipalityDane &&
                  String(m.dane).padStart(5, '0') ===
                  String(municipalityDane).padStart(5, '0');

                return (
                  sameDane ||
                  m.name === municipalityName
                );
              });

            if (municipality) {
              this.selectedMunicipalityId =
                municipality.id;

              this.clientsState
                .selectedEvaluationMunicipalityId =
                  municipality.id;
            }
          }
        },
        error: err => {
          console.error(
            'Error cargando municipios:',
            err
          );

          this.municipalities = [];
        }
      });
  }

  onDepartmentChange(departmentId: string) : void {
    this.selectedDepartmentId = departmentId || null;
    this.selectedMunicipalityId = null;
    this.municipalities = [];
    this.clientsState.selectedEvaluationDepartmentId = this.selectedDepartmentId;
    this.clientsState.selectedEvaluationMunicipalityId = null;
    if (this.selectedDepartmentId) {
      this.loadMunicipalities(this.selectedDepartmentId);
    }
  }

  onMunicipalityChange( municipalityId: string): void {
    this.selectedMunicipalityId = municipalityId || null;
    this.clientsState.selectedEvaluationMunicipalityId = this.selectedMunicipalityId;
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
    const subsegment = service.Subsegmento?.trim();
    const product = service.Producto?.trim()
    this.clientsState.selectedSubsegment = subsegment || null;
    this.clientsState.selectedProduct = product || null;

     const department = this.departments.find(d => d.name === service.Departamento);
    if (!department) {
      this.selectedDepartmentId = null;
      this.selectedMunicipalityId = null;
      this.municipalities = [];
      return;
    }
    this.selectedDepartmentId = department.id;
    this.clientsState.selectedEvaluationDepartmentId = department.id;

    this.selectedMunicipalityId = null;
    this.clientsState.selectedEvaluationMunicipalityId = null;
    this.loadMunicipalities(
      department.id,
      service.Municipio,
      service['Codigo DANE']
    );
  }

  onSubsegmentChange(subsegment: string): void {
    this.clientsState.selectedSubsegment =
      subsegment || null;
  }


  clearSelection(): void {
    this.clientsState.selectedService = null;
    this.clientsState.selectedSubsegment = null;
  }

  evaluateService(): void {
    if (!this.selectedSubsegment || !this.selectedProduct || this.selectedMunicipalityId) 
      return;
    this.evaluate.emit();
  }

}