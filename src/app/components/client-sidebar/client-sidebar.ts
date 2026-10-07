import { Component, Input, EventEmitter, Output, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';
import { ActiveClientsService } from '../../services/clients';
import { ClientOption, ServicesFilters} from '../../models/services';
import { ClientsSidebarState } from '../../services/clients-state';

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

  departments : any[] = [];
  municipalities : any[] = [];

  selectedDepartmentIds : any[] = [];
  selectedMunicipalityIds : any[] = [];

  departmentSearch = '';
  municipalitySearch = '';
  clientSearch = ''

  loadingMunicipalities = false;
  isLoadingClients = false;

  clients: ClientOption[] = [];
  selectedClients: string[] = [];

  constructor(
    private departmentService : Department,
    private municipalityService : Municipality,
    private activeClientsService : ActiveClientsService
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
      client: [...this.selectedClients]
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

    this.departmentsChange.emit([]);
    this.municipalitiesChange.emit([]);

    this.emitState();

    this.search.emit({
      municipality: [],
      client: []
    });
  }

  
  
}
