import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PricingSitesService } from '../../services/pricing-site';
import { 
  PricingSitesFilters, 
  PricingSitesResponse, 
  PricingSitesFilterOptions,
  PricingSitesClientOption
} from '../../models/pricing-site';
import { PricingSiteFilterOptionsService } from '../../services/pricing-site-filters';

import { finalize } from 'rxjs';
import { OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-pricing-sites-sidebar',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './pricing-sites-sidebar.html',
  styleUrl: './pricing-sites-sidebar.scss',
})
export class PricingSitesSidebar {

  isExpanded = true;
  isSearching = false;
  isLoadingFilterOptions = false;
  periodValue = 3; //3
  periodUnit = 'mes(es)'; //'mes(es)'
  PageSize = 15;
  filterOptions: PricingSitesFilterOptions | null = null;

  capacityMin: number | null = null;
  capacityMax: number | null = null;

  selectedFunnelStatuses: string[] = [];
  selectedDepartments: string[] = [];
  selectedMunicipalities: string[] = [];
  selectedProductFamilies: string[] = [];
  selectedProducts: string[] = [];
  selectedPlans: string[] = [];
  selectedClients: string[] = [];

  departmentSearch = '';
  municipalitySearch = '';
  productFamilySearch = '';
  productSearch = '';
  planSearch = '';
  clientSearch = '';

  periodUnits = [
    { value: 'día(s)', label: 'Días' },
    { value: 'semana(s)', label: 'Semanas' },
    { value: 'mes(es)', label: 'Meses' },
    { value: 'trimestre(s)', label: 'Trimestres' },
    { value: 'año(s)', label: 'Años' },
  ];

  constructor(
    private pricingSitesService: PricingSitesService,
    private pricingSiteFilterOptionsService: PricingSiteFilterOptionsService
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
  }

  private loadFilterOptions(): void {
    this.isLoadingFilterOptions = true;
    this.pricingSiteFilterOptionsService
      .getFilterOptions(
        this.periodValue,
        this.periodUnit,
        this.selectedDepartments,
        this.selectedMunicipalities,
        this.selectedProductFamilies,
        this.selectedProducts
      )
      .pipe(
        finalize(() => {
          this.isLoadingFilterOptions = false;
        })
      )
      .subscribe({
        next: (response: PricingSitesFilterOptions) => {
          console.log('FILTER OPTIONS:', response);
          console.log('TOTAL SITES:', response.total_sites);
          this.filterOptions = response;
        },
        error: error => {
          console.error(
            'Error cargando opciones de filtros:',
            error
          );
        }
      });
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

  @Output() pricingSitesLoaded = new EventEmitter<PricingSitesResponse>();
  @Output() filtersChanged = new EventEmitter<PricingSitesFilters>();
  
  search(): void {
    this.isSearching = true;
    const filters: PricingSitesFilters = {
      period_value: this.periodValue,
      period_unit: this.periodUnit as PricingSitesFilters['period_unit'],
      client: this.selectedClients,
      funnel_status: this.selectedFunnelStatuses,
      capacity_min: this.capacityMin ?? undefined,
      capacity_max: this.capacityMax ?? undefined,
      department: this.selectedDepartments,
      municipality: this.selectedMunicipalities,
      product_family: this.selectedProductFamilies,
      product: this.selectedProducts,
      plan: this.selectedPlans,
      page_size: this.PageSize,
      page: 1
    };
    this.filtersChanged.emit(filters);
    
    this.pricingSitesService
      .getPricingSites(filters)
      .pipe(
        finalize(() => {
          this.isSearching = false;
        })
      )
      .subscribe({
        next: (response: PricingSitesResponse) => {
          console.log('Respuesta:', response);
          this.pricingSitesLoaded.emit(response);
        },
        error: error => {
          console.error('Error consultando pricing sites:', error);
        }
      });
  }

  toggleFunnelStatus(status: string): void {
    if (this.selectedFunnelStatuses.includes(status)) {
      this.selectedFunnelStatuses =
        this.selectedFunnelStatuses.filter(s => s !== status);
    } else {
      this.selectedFunnelStatuses = [
        ...this.selectedFunnelStatuses,
        status
      ];
    }
  }

  toggleAllFunnelStatuses(): void {
    const statuses = this.filterOptions?.funnel_statuses ?? [];
    if (this.allFunnelStatusesSelected) {
      this.selectedFunnelStatuses = [];
    } else {
      this.selectedFunnelStatuses = [...statuses];
    }
  }

  get allFunnelStatusesSelected(): boolean {
    const statuses = this.filterOptions?.funnel_statuses ?? [];
    return (
      statuses.length > 0 &&
      this.selectedFunnelStatuses.length === statuses.length
    );
  }

  get availableDepartments(): string[] {
    return (this.filterOptions?.locations ?? [])
      .map(location => location.department);
  }

  toggleDepartment(department: string): void {
    if (this.selectedDepartments.includes(department)) {
      this.selectedDepartments =
        this.selectedDepartments.filter(d => d !== department);
    } else {
      this.selectedDepartments = [
        ...this.selectedDepartments,
        department
      ];
    }
    this.selectedMunicipalities = [];
    this.loadFilterOptions();
  }

  get allDepartmentsSelected(): boolean {
    const departments = this.availableDepartments;
    return (
      departments.length > 0 &&
      this.selectedDepartments.length === departments.length
    );
  }

  toggleAllDepartments(): void {
    const departments = this.availableDepartments;
    if (this.allDepartmentsSelected) {
      this.selectedDepartments = [];
    } else {
      this.selectedDepartments = [...departments];
    }
    this.selectedMunicipalities = [];
    this.loadFilterOptions();
  }

  get filteredDepartments(): string[] {
    const search = this.departmentSearch
      .trim()
      .toLowerCase();

    return this.availableDepartments.filter(department =>
      department.toLowerCase().includes(search)
    );
  }

  get availableMunicipalities(): string[] {
    return [
      ...new Set(
        (this.filterOptions?.locations ?? [])
          .filter(location =>
            this.selectedDepartments.includes(location.department)
          )
          .flatMap(location =>
            location.municipalities.map(m => m.municipality)
          )
      )
    ];
  }

  toggleMunicipality(municipality: string): void {
    if (this.selectedMunicipalities.includes(municipality)) {
      this.selectedMunicipalities =
        this.selectedMunicipalities.filter(m => m !== municipality);
    } else {
      this.selectedMunicipalities = [
        ...this.selectedMunicipalities,
        municipality
      ];
    }
    this.loadFilterOptions();
  }

  get allMunicipalitiesSelected(): boolean {
    const municipalities = this.availableMunicipalities;

    return (
      municipalities.length > 0 &&
      this.selectedMunicipalities.length === municipalities.length
    );
  }
  toggleAllMunicipalities(): void {
    const municipalities = this.availableMunicipalities;
    if (this.allMunicipalitiesSelected) {
      this.selectedMunicipalities = [];
    } else {
      this.selectedMunicipalities = [...municipalities];
    }
    this.loadFilterOptions();
  }


  get filteredMunicipalities(): string[] {
    const search = this.municipalitySearch
      .trim()
      .toLowerCase();

    return this.availableMunicipalities.filter(municipality =>
      municipality.toLowerCase().includes(search)
    );
  }

  get availableProductFamilies(): string[] {
    return [
      ...new Set(
        (this.filterOptions?.products ?? [])
          .map(productFamily => productFamily.family)
      )
    ];
  }

  get filteredProductFamilies(): string[] {
    const search = this.productFamilySearch
      .trim()
      .toLowerCase();

    return this.availableProductFamilies.filter(family =>
      family.toLowerCase().includes(search)
    );
  }

  toggleProductFamily(family: string): void {
    if (this.selectedProductFamilies.includes(family)) {
      this.selectedProductFamilies =
        this.selectedProductFamilies.filter(f => f !== family);
    } else {
      this.selectedProductFamilies = [
        ...this.selectedProductFamilies,
        family
      ];
    }
    this.selectedProducts = [];
    this.selectedPlans = [];
    this.loadFilterOptions();
  }

  get allProductFamiliesSelected(): boolean {
    const families = this.availableProductFamilies;
    return (
      families.length > 0 &&
      this.selectedProductFamilies.length === families.length
    );
  }

  toggleAllProductFamilies(): void {
    const families = this.availableProductFamilies;
    if (this.allProductFamiliesSelected) {
      this.selectedProductFamilies = [];
    } else {
      this.selectedProductFamilies = [...families];
    }
    this.selectedProducts = [];
    this.selectedPlans = [];
    this.loadFilterOptions();
  }

  get availableProducts(): string[] {
    return [
      ...new Set(
        (this.filterOptions?.products ?? [])
          .filter(productFamily =>
            this.selectedProductFamilies.includes(productFamily.family)
          )
          .flatMap(productFamily =>
            productFamily.products.map(product => product.product)
          )
      )
    ];
  }

  get filteredProducts(): string[] {
    const search = this.productSearch
      .trim()
      .toLowerCase();

    return this.availableProducts.filter(product =>
      product.toLowerCase().includes(search)
    );
  }

  toggleProduct(product: string): void {
    if (this.selectedProducts.includes(product)) {
      this.selectedProducts =
        this.selectedProducts.filter(p => p !== product);
    } else {
      this.selectedProducts = [
        ...this.selectedProducts,
        product
      ];
    }
    this.selectedPlans = [];
    this.loadFilterOptions();
  }

  get allProductsSelected(): boolean {
    const products = this.availableProducts;
    return (
      products.length > 0 &&
      this.selectedProducts.length === products.length
    );
  }

toggleAllProducts(): void {
  const products = this.availableProducts;
    if (this.allProductsSelected) {
      this.selectedProducts = [];
    } else {
      this.selectedProducts = [...products];
    }
    this.selectedPlans = [];
    this.loadFilterOptions();
  }

  get availablePlans(): string[] {
    return [
      ...new Set(
        (this.filterOptions?.products ?? [])
          .filter(productFamily =>
            this.selectedProductFamilies.includes(productFamily.family)
          )
          .flatMap(productFamily =>
            productFamily.products
              .filter(product =>
                this.selectedProducts.includes(product.product)
              )
              .flatMap(product =>
                product.plans
              )
          )
      )
    ];
  }

  get filteredPlans(): string[] {
    const search = this.planSearch.trim().toLowerCase();
    return this.availablePlans.filter(plan =>
      plan.toLowerCase().includes(search)
    );
  }

  togglePlan(plan: string): void {
    if (this.selectedPlans.includes(plan)) {
      this.selectedPlans =
        this.selectedPlans.filter(p => p !== plan);
    } else {
      this.selectedPlans = [
        ...this.selectedPlans,
        plan
      ];
    }
  }

  get allPlansSelected(): boolean {
    const plans = this.availablePlans;
    return (
      plans.length > 0 &&
      this.selectedPlans.length === plans.length
    );
  }

  toggleAllPlans(): void {
    const plans = this.availablePlans;

    if (this.allPlansSelected) {
      this.selectedPlans = [];
    } else {
      this.selectedPlans = [...plans];
    }
  }

  get availableClients(): PricingSitesClientOption[] {
    return this.filterOptions?.clients ?? [];
  }

  get filteredClients(): PricingSitesClientOption[] {
    const search = this.clientSearch
      .trim()
      .toLowerCase();
    if (!search) {
      return this.availableClients;
    }
    return this.availableClients.filter(client => {
      const nitMatches = client.nit
        .toLowerCase()
        .includes(search);
      const businessNameMatches = client.business_names.some(
        businessName =>
          businessName.toLowerCase().includes(search)
      );
      return nitMatches || businessNameMatches;
    });
  }

  toggleClient(nit: string): void {
    if (this.selectedClients.includes(nit)) {
      this.selectedClients =
        this.selectedClients.filter(n => n !== nit);
    } else {
      this.selectedClients = [
        ...this.selectedClients,
        nit
      ];
    }
  }

  get allClientsSelected(): boolean {
    const clients = this.availableClients;
    return (
      clients.length > 0 &&
      this.selectedClients.length === clients.length
    );
  }

  toggleAllClients(): void {
    const clients = this.availableClients;
    if (this.allClientsSelected) {
      this.selectedClients = [];
    } else {
      this.selectedClients = clients.map(client => client.nit);
    }
  }

  onPeriodChange(): void {
    this.loadFilterOptions();
  }

}