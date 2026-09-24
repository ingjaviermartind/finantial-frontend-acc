import { Component, Input, EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Department } from '../../services/department';
import { Municipality } from '../../services/municipality';

@Component({
  selector: 'app-evaluador-sidebar',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './evaluador-sidebar.html',
  styleUrl: './evaluador-sidebar.scss',
})

export class EvaluadorSidebar {
  @Input() isExpanded = true;

  @Output() departmentsChange = new EventEmitter<any[]>();
  @Output() municipalitiesChange = new EventEmitter<any[]>();
  @Output() search = new EventEmitter<any[]>();

  departments : any[] = [];
  municipalities : any[] = [];

  selectedDepartmentIds : any[] = [];
  selectedMunicipalityIds : any[] = [];

  departmentSearch = '';
  municipalitySearch = '';

  loadingMunicipalities = false;

  constructor(
    private departmentService : Department,
    private municipalityService : Municipality
  ) {}

  ngOnInit() : void {
    this.loadDepartments();
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
    this.departmentsChange.emit(
      this.selectedDepartmentIds
    );
    this.municipalitiesChange.emit([]);
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

    this.municipalitiesChange.emit(
      this.selectedMunicipalityIds
    );
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

    this.municipalitiesChange.emit(
      this.selectedMunicipalityIds
    );
    }
    
  searchServices(): void {
    if (this.selectedMunicipalityIds.length === 0) {
      return;
    }
    this.search.emit(this.selectedMunicipalityIds);
  }
}
