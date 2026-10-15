import { Component, Input, EventEmitter, Output, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';
import { ActiveClientsService } from '../../services/clients';
import { ClientOption, ServicesFilters} from '../../models/services';
import { ClientsSidebarState } from '../../services/clients-state';
import { ProductCatalogService } from '../../services/product-catalog';
import { department, municipality } from '../../models/location';
import { Subsegment } from '../../models/subsegment';
import { ClientSubsegmentService } from '../../services/subsegments';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.scss',
})

export class ClientSidebar implements OnInit {
  @Input() isExpanded = true;
  @Input() initialState : ClientsSidebarState = 
  {
    selectedDepartmentIds: [],
    selectedMunicipalityIds: [],
    selectedClients: [],
    departmentSearch: '',
    municipalitySearch: '',
    clientSearch: ''
  }
  @Output() departmentsChange = new EventEmitter<any[]>();
  @Output() municipalitiesChange = new EventEmitter<any[]>();
  @Output() stateChange = new EventEmitter<ClientsSidebarState>();
  @Output() search = new EventEmitter<ServicesFilters>();

  departments : department[] = [];
  municipalities : municipality[] = [];

  selectedDepartmentIds : any[] = [];
  selectedMunicipalityIds : any[] = [];

  departmentSearch = '';
  municipalitySearch = '';
  clientSearch = ''

  loadingMunicipalities = false;
  isLoadingClients = false;

  clients: ClientOption[] = [];
  selectedClients: string[] = [];

  capacityMin: number | null = null;
  capacityMax: number | null = null;

  products: string[] = [];
  selectedProducts: string[] = [];
  productSearch = '';

  subsegments: Subsegment[] = [];
  selectedSubsegmentIds: any[] = [];

  constructor(
    private departmentService : Department,
    private municipalityService : Municipality,
    private activeClientsService : ActiveClientsService,
    private productCatalogService : ProductCatalogService,
    private clientSubsegmentService : ClientSubsegmentService
  ) {}

  ngOnInit() : void {
    this.selectedDepartmentIds = [...this.initialState.selectedDepartmentIds];
    this.selectedMunicipalityIds = [...this.initialState.selectedMunicipalityIds];
    this.selectedClients = [...this.initialState.selectedClients];
    this.departmentSearch = this.initialState.departmentSearch;
    this.municipalitySearch = this.initialState.municipalitySearch;
    this.clientSearch = this.initialState.clientSearch;
    this.loadDepartments();
    if (this.selectedDepartmentIds.length > 0) {
      this.loadMunicipalities();
    }
    this.loadClients();
    this.loadProducts();
    this.loadSubsegments();
  }
  
  private loadSubsegments(): void {
    this.clientSubsegmentService.getAll().subscribe({
      next: data => {
        this.subsegments = [...data].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
      },
      error: err => {
        console.error('Error cargando subsegmentos:', err);
        this.subsegments = [];
      }
    });
  }

  get allSubsegmentsSelected(): boolean {
    return this.subsegments.length > 0 &&
      this.subsegments.every(subsegment =>
        this.selectedSubsegmentIds.includes(subsegment.id)
      );
  }

  toggleSubsegment(id: string): void {
    if (this.selectedSubsegmentIds.includes(id)) {
      this.selectedSubsegmentIds =
        this.selectedSubsegmentIds.filter(
          subsegmentId => subsegmentId !== id
        );
    } else {
      this.selectedSubsegmentIds = [
        ...this.selectedSubsegmentIds,
        id
      ];
    }
  }

  toggleAllSubsegments(): void {
    this.selectedSubsegmentIds = this.allSubsegmentsSelected
      ? []
      : this.subsegments.map(subsegment => subsegment.id);
  }

  private loadProducts(): void {
    this.productCatalogService.getAll().subscribe({
      next: data => {
        this.products = [
          ...new Set(
            data
              .map(item => item.product?.trim())
              .filter((product): product is string => !!product)
          )
        ].sort((a, b) => a.localeCompare(b));
      },
      error: err => {
        console.error('Error cargando productos:', err);
        this.products = [];
      }
    });
  }

  get filteredProducts(): string[] {
    const search = this.productSearch.trim().toLowerCase();

    return this.products.filter(product =>
      product.toLowerCase().includes(search)
    );
  }

  get allProductsSelected(): boolean {
    return this.products.length > 0 &&
      this.products.every(product =>
        this.selectedProducts.includes(product)
      );
  }

  toggleProduct(product: string): void {
    if (this.selectedProducts.includes(product)) {
      this.selectedProducts = this.selectedProducts.filter(
        item => item !== product
      );
    } else {
      this.selectedProducts = [...this.selectedProducts, product];
    }
  }

  toggleAllProducts(): void {
    this.selectedProducts = this.allProductsSelected
      ? []
      : [...this.products];
  }

  private loadClients(): void {
    this.isLoadingClients = true;
    this.activeClientsService
      .getActiveClients()
      .subscribe({
        next: clients => {
          this.clients = clients;
          
        },
        error: error => {
          console.error(
            'Error cargando clientes activos:',
            error
          );
        },
        complete: () => {
          this.isLoadingClients = false;
        }

      });
  }

  get filteredClients(): ClientOption[] {
    const search = this.clientSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return this.clients;
    }
    return this.clients.filter(client => {
      const nitMatches = client.NIT
        .toLowerCase()
        .includes(search);
      const businessNameMatches =
        client.business_names.some(
          name =>
            name.toLowerCase().includes(search)
        );
      return nitMatches || businessNameMatches;
    });
  }

  toggleClient(nit: string): void {
    if (this.selectedClients.includes(nit)) {
      this.selectedClients =
        this.selectedClients.filter(
          clientNit => clientNit !== nit
        );
    } else {
      this.selectedClients = [
        ...this.selectedClients,
        nit
      ];
    }
  }

  toggleAllClients(): void {
    if (this.allClientsSelected) {
      this.selectedClients = [];
    } else {
      this.selectedClients =
        this.clients.map(client => client.NIT);
    }
  }

  get allClientsSelected(): boolean {
    return (
      this.clients.length > 0 &&
      this.selectedClients.length === this.clients.length
    );
  }

  loadDepartments() : void {
    this.departmentService
      .getDepartments()
      .subscribe({
        next: data => {
          this.departments = [...data].sort(
            (a, b) => a.name.localeCompare(b.name)
          );
        },
        error: err => {
          console.error(
            'Error cargando departamentos:',
            err
          );
        }
      });
  }

  emitState(): void {
  this.stateChange.emit({
    selectedDepartmentIds: [...this.selectedDepartmentIds],
    selectedMunicipalityIds: [...this.selectedMunicipalityIds],
    selectedClients: [...this.selectedClients],
    departmentSearch: this.departmentSearch,
    municipalitySearch: this.municipalitySearch,
    clientSearch: this.clientSearch
  });
}

  get allDepartmentsSelected(): boolean {
    return this.departments.length > 0 &&
      this.selectedDepartmentIds.length === this.departments.length;
  }

  get filteredDepartments(): any[] {
    const search = this.departmentSearch.trim().toLowerCase();
    if (!search) {
      return this.departments;
    }
    return this.departments.filter(department =>
      department.name.toLowerCase().includes(search)
    );
  }

  toggleDepartment(id: any): void {
    if (this.selectedDepartmentIds.includes(id)) {
      this.selectedDepartmentIds =
        this.selectedDepartmentIds.filter(
          departmentId => departmentId !== id
        );
    } else {
      this.selectedDepartmentIds = [
        ...this.selectedDepartmentIds,
        id
      ];
    }
    this.selectedMunicipalityIds = [];
    this.municipalities = [];
    this.departmentsChange.emit( this.selectedDepartmentIds);
    this.municipalitiesChange.emit([]);
    this.emitState();
    this.loadMunicipalities();
  }

  toggleAllDepartments(): void {
    if (this.allDepartmentsSelected) {
      this.selectedDepartmentIds = [];
    } else {
      this.selectedDepartmentIds =
        this.departments.map(
          department => department.id
        );
    }
    this.selectedMunicipalityIds = [];
    this.municipalities = [];
    this.departmentsChange.emit(this.selectedDepartmentIds);
    this.municipalitiesChange.emit([]);
    this.emitState();
    this.loadMunicipalities();
  }

  loadMunicipalities(): void {

  if (this.selectedDepartmentIds.length === 0) {
    this.municipalities = [];
    return;
  }

  this.loadingMunicipalities = true;
    this.municipalityService
      .getByDepartments(this.selectedDepartmentIds)
      .subscribe({
        next: data => {
          this.municipalities = [...data].sort(
            (a, b) => a.name.localeCompare(b.name)
          );
          this.loadingMunicipalities = false;
        },
        error: err => {
          console.error(
            'Error cargando municipios:',
            err
          );
          this.municipalities = [];
          this.loadingMunicipalities = false;
        }
      });
  }

  get allMunicipalitiesSelected(): boolean {
    return this.municipalities.length > 0 &&
      this.selectedMunicipalityIds.length === this.municipalities.length;
  }

  get filteredMunicipalities(): any[] {
    const search = this.municipalitySearch.trim().toLowerCase();
    if (!search) {
      return this.municipalities;
    }
    return this.municipalities.filter(municipality =>
        municipality.name.toLowerCase().includes(search)
      );
  }

  toggleMunicipality(id: any): void {
    if (this.selectedMunicipalityIds.includes(id)) {
      this.selectedMunicipalityIds =
        this.selectedMunicipalityIds.filter(
          municipalityId => municipalityId !== id
        );
    } else {
      this.selectedMunicipalityIds = [
        ...this.selectedMunicipalityIds,
        id
      ];
    }
    this.municipalitiesChange.emit(this.selectedMunicipalityIds);
    this.emitState();
  }

  toggleAllMunicipalities(): void {
    if (this.allMunicipalitiesSelected) {
      this.selectedMunicipalityIds = [];
    } else {
      this.selectedMunicipalityIds =
        this.municipalities.map(
          municipality => municipality.id
        );
    }
    this.municipalitiesChange.emit(this.selectedMunicipalityIds);
    this.emitState();
    }
    
  searchServices(): void {
    const filters: ServicesFilters = {
      municipality: [...this.selectedMunicipalityIds],
      department: [...this.selectedDepartmentIds],
      client: [...this.selectedClients],
      capacity_min: this.capacityMin ?? undefined,
      capacity_max: this.capacityMax ?? undefined,
      product: [...this.selectedProducts],
      subsegment: [...this.selectedSubsegmentIds]
    };
    this.search.emit(filters);
  }

  clearFilters(): void {
    this.selectedDepartmentIds = [];
    this.selectedMunicipalityIds = [];
    this.selectedClients = [];

    this.departmentSearch = '';
    this.municipalitySearch = '';
    this.clientSearch = '';

    this.municipalities = [];

    this.loadingMunicipalities = false;

    this.capacityMin = null;
    this.capacityMax = null;
    this.selectedProducts = [];
    this.productSearch = '';

    this.selectedSubsegmentIds = [];

    this.departmentsChange.emit([]);
    this.municipalitiesChange.emit([]);

    this.emitState();

    this.search.emit({
      municipality: [],
      client: []
    });
  }

  
  
}
