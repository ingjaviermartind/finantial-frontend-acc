import { Component } from '@angular/core';
import { EvaluatorSidebar } from '../../../components/evaluator-sidebar/evaluator-sidebar';
import { municipality } from '../../../models/location';
import { PricingRequest, ProjectServiceRow, DetailedPricingRequest, MultiProjectPricingRequest, GroupEvaluationResult} from '../../../models/pricing';
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
  consolidatedResult: GroupEvaluationResult | null = null;
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
        selected: false,
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
  }

  toggleAllServices(selected: boolean): void {
    this.services.forEach(row => {
      row.selected = selected;
    });
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
    return this.services.reduce(
      (total, row) => total + row.request.capacity_mbps,
      0
    );
  }

  private invalidateConsolidation(): void {
    this.consolidatedResult = null;
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

  evaluateConsolidation(): void {
    // 1. Validar que existan servicios
    if (this.services.length === 0 || this.loadingConsolidation) {
      return;
    }
    // 2. Evitar consolidar mientras haya evaluaciones individuales en curso
    const pendingServices = this.services.some(row =>
      row.loading || row.loadingPrice
    );
    if (pendingServices) {
      this.consolidationError =
        'Espera a que terminen las evaluaciones pendientes antes de consolidar.';
      return;
    }
    // 3. Tomar el plazo contractual común
    const firstService = this.services[0];

    // 4. Construir solicitud multiproyecto
    const request: MultiProjectPricingRequest = {
      contract_time: firstService.request.contract_time,
      initial_capex: 0,
      initial_income: 0,

      products: this.services.map(row => ({
        capacity_mbps: row.request.capacity_mbps,
        product_type: row.details.product.product_type,
        product: row.details.product.product,
        subsegment: row.details.subsegment.name,

        // Si no hay tarifa, se utiliza el factor de margen normal
        sensitivity: 1,

        // Si hay tarifa diligenciada, se utiliza directamente
        price_per_mbps: row.pricePerMbps
      }))
    };

    // 5. Ejecutar evaluación consolidada
    this.loadingConsolidation = true;
    this.consolidationError = null;
    this.consolidatedResult = null;
    console.log(
        'PRECIOS ENVIADOS:',
        request.products.map(p => ({
            product: p.product,
            price_per_mbps: p.price_per_mbps
        }))
    );
    this.pricingService.evaluateGroup(request).pipe(
      finalize(() => {
        this.loadingConsolidation = false;
      })
    ).subscribe({
      next: response => {
        this.consolidatedResult = response;
        console.log('Evaluación multiproyecto:', response);
      },
      error: err => {
        this.consolidationError =
          err.error?.detail ??
          'No fue posible realizar la evaluación financiera del proyecto.';

        console.error('Error evaluando proyecto consolidado:', err);
      }
    });
  }

  clearConsolidatedResult(): void {
    this.consolidatedResult = null;
    this.consolidationError = null;
  }
}
