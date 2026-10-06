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
  selectedProduct: string | null = null;
  selectedSubsegment: string | null = null;
  expandedClientNits: string[] = [];
  services: ActiveService[] = [];
  servicesSearched = false;
  isFiltersExpanded = true;
  selectedService: ActiveService | null = null;
  selectedEvaluationDepartmentId: string | null = null;
  selectedEvaluationMunicipalityId: string | null = null;
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
    this.selectedSubsegment = null;
    this.selectedProduct = null;
    this.selectedEvaluationDepartmentId = null;
    this.selectedEvaluationMunicipalityId = null;
    this.expandedClientNits = [];
    this.services = [];
    this.servicesSearched = false;
    this.isFiltersExpanded = true;
  }
}
