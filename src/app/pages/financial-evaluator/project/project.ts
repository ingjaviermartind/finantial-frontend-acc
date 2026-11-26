import { Component } from '@angular/core';
import { EvaluatorSidebar } from '../../../components/evaluator-sidebar/evaluator-sidebar';
import { municipality } from '../../../models/location';
import { PricingRequest, ProjectServiceRow, DetailedPricingRequest } from '../../../models/pricing';
import { PageWithSidebar } from '../../../layouts/page-with-sidebar/page-with-sidebar';
import { PricingService } from '../../../services/pricing';
import { finalize } from 'rxjs';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-project',
  imports: [EvaluatorSidebar, PageWithSidebar,CurrencyPipe, DecimalPipe],
  templateUrl: './project.html',
  styleUrl: './project.scss',
})
export class Project {
  isFiltersExpanded = true;
  selectedMunicipality: municipality | null = null;

  services: ProjectServiceRow[] = [];

  private nextServiceId = 0;

  loadingConsolidation = false;
  consolidatedResult: unknown;
  consolidationError: string | null = null;

  constructor(
    private pricingService: PricingService
  ) {}

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onSelectedDaneChange(location: municipality | null): void {
    this.selectedMunicipality = location;
  }

  addService(data: DetailedPricingRequest): void {
    // 1. Validar que todos los servicios tengan el mismo plazo contractual
    if (this.services.length > 0) {
        const projectContractTime = this.services[0].request.contract_time;

        if (data.request.contract_time !== projectContractTime) {
            window.alert(
                `El proyecto ya tiene un plazo contractual de ${projectContractTime} meses.\n\n` +
                `No puedes agregar servicios con un plazo diferente.`
            );
            return;
        }
    }

    // 2. Evitar servicios duplicados
    const alreadyExists = this.services.some(row =>
        row.request.municipality_id === data.request.municipality_id &&
        row.request.product_id === data.request.product_id &&
        row.request.subsegment_id === data.request.subsegment_id &&
        row.request.capacity_mbps === data.request.capacity_mbps &&
        row.request.contract_time === data.request.contract_time
    );

    if (alreadyExists) {
        window.alert(
            'Este servicio ya está agregado al proyecto.'
        );
        return;
    }

    // 3. Crear servicio
    const row: ProjectServiceRow = {
        id: ++this.nextServiceId,
        request: { ...data.request },
        details: {
            department: { ...data.department },
            municipality: { ...data.municipality },
            product: { ...data.product },
            subsegment: { ...data.subsegment }
        },
        selected: true,
        loading: true,
        pricePerMbps: data.request.price_per_mbps ?? null,
        loadingPrice: false
    };

    this.services = [...this.services, row];
    this.invalidateConsolidation();

    // 4. Evaluar servicio
    this.pricingService.evaluate(row.request).pipe(
        finalize(() => {
            row.loading = false;
        })
    ).subscribe({
        next: response => {
            row.result = response;
        },
        error: err => {
            row.error = 'No fue posible evaluar este servicio.';
            console.error('Error evaluando servicio:', err);
        }
    });
  }

  toggleServiceSelection(row: ProjectServiceRow): void {
    row.selected = !row.selected;
    this.invalidateConsolidation();
  }

  toggleAllServices(selected: boolean): void {
    this.services.forEach(row => {
      row.selected = selected;
    });

    this.invalidateConsolidation();
  }

  updatePrice(row: ProjectServiceRow, price: number | null): void {
    row.pricePerMbps = price;
  }

  evaluateServicePrice(row: ProjectServiceRow): void {
    const price = row.pricePerMbps;

    if (
      price === null ||
      price < 0 ||
      row.loadingPrice ||
      !row.result
    ) {
      return;
    }

    const request: PricingRequest = {
      ...row.request,
      price_per_mbps: price
    };

    row.loadingPrice = true;
    row.priceResult = undefined;

    this.pricingService.evaluatePrice(request).pipe(
      finalize(() => {
        row.loadingPrice = false;
      })
    ).subscribe({
      next: response => {
        row.priceResult = response;
        row.request = request;
        this.invalidateConsolidation();
      },
      error: err => {
        console.error('Error evaluando precio:', err);
      }
    });
  }

  get selectedServices(): ProjectServiceRow[] {
    return this.services.filter(row => row.selected);
  }

  get allServicesSelected(): boolean {
    return this.services.length > 0 &&
      this.services.every(row => row.selected);
  }

  get totalCapacity(): number {
    return this.selectedServices.reduce(
      (total, row) => total + row.request.capacity_mbps,
      0
    );
  }

  private invalidateConsolidation(): void {
    this.consolidatedResult = undefined;
    this.consolidationError = null;
  }

  enablePriceEditing(row: ProjectServiceRow): void {
    row.priceResult = undefined;
    row.pricePerMbps = null;
    this.invalidateConsolidation();
  }

  removeService(row: ProjectServiceRow): void {
    const confirmed = window.confirm(
        `¿Deseas eliminar el servicio #${row.id} del proyecto?`
    );
    if (!confirmed) return;
    this.services = this.services.filter(service => service.id !== row.id);
    this.invalidateConsolidation();
  }

  evaluateConsolidation() {
    
  }
}
