import { Injectable } from '@angular/core';
import { ActiveService } from '../models/services';
import { PricingResponse, PricingRequest, EvaluationResult } from '../models/pricing';

export interface ClientsSidebarState {
  selectedDepartmentIds : string[];
  selectedMunicipalityIds : string[];
  selectedClients: string[];

  departmentSearch: string;
  municipalitySearch: string;
  clientSearch: string;
}

@Injectable({
  providedIn: 'root',
})

export class ClientsState
{
  sidebar : ClientsSidebarState = {
    selectedDepartmentIds: [],
    selectedMunicipalityIds : [],
    selectedClients: [],
    departmentSearch : '',
    municipalitySearch : '',
    clientSearch : ''
  }
  evaluationCapacityMbps: number | null = null;
  evaluationContractTime: number | null = null;
  evaluationInitialCapex = 0;
  evaluationPricingResult: PricingResponse | undefined;
  evaluationLastRequest: PricingRequest | undefined;
  evaluationPriceToEvaluate: number | null = null;
  evaluationPriceResult: EvaluationResult | undefined;
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

  saveEvaluationPrice(price: number | null, result: EvaluationResult | undefined): void {
    this.evaluationPriceToEvaluate = price;
    this.evaluationPriceResult = result;
  }

  saveEvaluationInputs(capacityMbps: number | null, contractTime: number | null, initialCapex: number): void {
    this.evaluationCapacityMbps = capacityMbps;
    this.evaluationContractTime = contractTime;
    this.evaluationInitialCapex = initialCapex;
  }

  saveEvaluationResult(result: PricingResponse): void {
    this.evaluationPricingResult = result;
  }

  saveEvaluationRequest(request: PricingRequest): void {
    this.evaluationLastRequest = { ...request };
  }

  clearEvaluation(): void {
    this.evaluationCapacityMbps = null;
    this.evaluationContractTime = null;
    this.evaluationInitialCapex = 0;
    this.evaluationPricingResult = undefined;
    this.evaluationLastRequest = undefined;
    this.evaluationPriceToEvaluate = null;
    this.evaluationPriceResult = undefined;
  }

  clear(): void {
    this.sidebar = {
      selectedDepartmentIds: [],
      selectedMunicipalityIds: [],
      selectedClients:[],
      departmentSearch: '',
      municipalitySearch: '',
      clientSearch:''
    };
    this.selectedSubsegment = null;
    this.selectedProduct = null;
    this.selectedEvaluationDepartmentId = null;
    this.selectedEvaluationMunicipalityId = null;
    this.expandedClientNits = [];
    this.services = [];
    this.servicesSearched = false;
    this.isFiltersExpanded = true;
    this.evaluationCapacityMbps = null;
    this.evaluationContractTime = null;
    this.evaluationInitialCapex = 0;
    this.evaluationPricingResult = undefined;
    this.evaluationLastRequest = undefined;
    this.evaluationPriceToEvaluate = null;
    this.evaluationPriceResult = undefined;
  }
}
