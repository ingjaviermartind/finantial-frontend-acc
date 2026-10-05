import { Injectable } from '@angular/core';
import { ActiveService } from '../models/services';

export interface ClientsSidebarState {
  selectedDepartmentIds : string[];
  selectedMunicipalityIds : string[];

  departmentSearch: string;
  municipalitySearch: string;
}

@Injectable({
  providedIn: 'root',
})

export class ClientsState
{
  sidebar : ClientsSidebarState = {
    selectedDepartmentIds: [],
    selectedMunicipalityIds : [],
    departmentSearch : '',
    municipalitySearch : '',
  }

  services: ActiveService[] = [];
  servicesSearched = false;
  isFiltersExpanded = true;
  saveServices(services: ActiveService[]): void {
    this.services = services;
  }
  clear(): void {
    this.sidebar = {
      selectedDepartmentIds: [],
      selectedMunicipalityIds: [],
      departmentSearch: '',
      municipalitySearch: ''
    };
    
    this.services = [];
    this.servicesSearched = false;
    this.isFiltersExpanded = true;
  }
}
