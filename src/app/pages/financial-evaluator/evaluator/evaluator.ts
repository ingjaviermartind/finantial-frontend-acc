import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ClientsState } from '../../../services/clients-state';
import { PricingService } from '../../../services/pricing';
import { ActiveService, SelectedDaneLocation } from '../../../models/services';
import { PricingRequest, PricingResponse, EvaluationResult, PriceComparison} from '../../../models/pricing';

import { EvaluatorSidebar } from '../../../components/evaluator-sidebar/evaluator-sidebar';

import { CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';

import { municipality } from '../../../models/location';

import {Chart, registerables } from 'chart.js'
import { PageWithSidebar } from '../../../layouts/page-with-sidebar/page-with-sidebar';

import { CashFlowDetail } from '../components/cashflow-detail/cashflow-detail';

Chart.register(...registerables);

interface PriceMarker {
  key: string;
  label: string;
  value: number;
  position: number;
  colorClass: string;
  lane: 'top' | 'bottom' | 'below';
}

interface PriceSegment {
  colorClass: string;
  width: number;
}

@Component({
  selector: 'app-evaluacion-servicio',
  imports: [
    PageWithSidebar,
    EvaluatorSidebar,
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    PercentPipe,
    PageWithSidebar,
    CashFlowDetail
],
  standalone: true,
  templateUrl: './evaluator.html',
  styleUrl: './evaluator.scss',
})

export class Evaluator implements OnDestroy {
  isFiltersExpanded = true;
  loadingCalculation = false;
  loadingPriceEvaluation = false;
  pricingResult: PricingResponse | undefined;
  priceToEvaluate: number | null = null;

  priceEvaluationResult: EvaluationResult | undefined;
  private lastPricingRequest: PricingRequest | undefined;

  selectedMunicipality: municipality | null = null;

  selectedCashFlow: 'suggested' | 'floor' | 'evaluated' = 'suggested';

  private cashFlowChart?: Chart;
  private cashFlowCanvas?: HTMLCanvasElement;

  private priceComparisonChart?: Chart;
  private priceComparisonCanvas?: HTMLCanvasElement;

  showCashFlowDetail = false;
  selectedCashFlowDetail: 'suggested' | 'floor' | 'evaluated' = 'suggested';

  constructor(
    private clientsState: ClientsState,
    private pricingService : PricingService
  ) {}

  ngOnDestroy(): void {
    this.cashFlowChart?.destroy();
    this.priceComparisonChart?.destroy();
  }

  ngOnInit(): void {
    this.pricingResult = this.clientsState.evaluationPricingResult;
    this.lastPricingRequest = this.clientsState.evaluationLastRequest;
    this.priceToEvaluate = this.clientsState.evaluationPriceToEvaluate;
    this.priceEvaluationResult = this.clientsState.evaluationPriceResult;
  }

  private normalizeDane(value: unknown): string {
    return String(value ?? '').trim().padStart(5, '0');
  }

  onSelectedDaneChange(location: municipality | null): void {
    this.selectedMunicipality = location;
  }

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }


  evaluateService(request : PricingRequest): void {
    this.selectedCashFlow = 'suggested';

    this.lastPricingRequest = {...request};
    this.clientsState.saveEvaluationRequest(request);
    this.pricingResult = undefined;
    this.updateCashFlowChart();
    this.priceEvaluationResult = undefined;
    this.priceToEvaluate = null;
    this.clientsState.saveEvaluationPrice(null, undefined);
    this.loadingCalculation = true;
    this.pricingService.evaluate(request).pipe(
      finalize(() => {
        this.loadingCalculation = false;
      })
    ).subscribe({
      next : response => {
        this.pricingResult = response;
        this.clientsState.saveEvaluationResult(response);
        requestAnimationFrame(() => {
          this.detectLabelOverlaps();
        });
        console.log(response);
      },
      error : err => {
        console.error('Error evaluando servicio:', err);
      }
    });
  }

  evaluatePrice(): void {
    if (
      this.priceToEvaluate === null ||
      this.priceToEvaluate < 0 ||
      !this.lastPricingRequest
    ) {
      return;
    }
    const request: PricingRequest = {...this.lastPricingRequest, price_per_mbps: this.priceToEvaluate};
    this.loadingPriceEvaluation = true;
    this.priceEvaluationResult = undefined;
    if (this.selectedCashFlow === 'evaluated') {
      this.selectedCashFlow = 'suggested';
    }
    this.updateCashFlowChart();
    this.pricingService.evaluatePrice(request).pipe(
      finalize(() => {
        this.loadingPriceEvaluation = false;
      })
    ).subscribe({
      next: response => {
        this.priceEvaluationResult = response;
        this.updateCashFlowChart();
        console.log(response);
        this.clientsState.saveEvaluationPrice(this.priceToEvaluate, response);
      },
      error: err => {
        console.error('Error evaluando precio:', err);
      }
    });
  }
  
  resetPriceEvaluation(): void {
    this.priceToEvaluate = null;
    this.priceEvaluationResult = undefined;

    if (this.selectedCashFlow === 'evaluated') 
      this.selectedCashFlow = 'suggested';

    if (this.isDetailed) {
      this.updateCashFlowChart();
    }
  }

  get isDetailed(): boolean {
    const suggested = this.pricingResult?.suggested;
    return suggested?.capex != null && suggested?.opex_m != null;
  }

  

  @ViewChild('cashFlowChart')
  set cashFlowChartCanvas(ref: ElementRef<HTMLCanvasElement> | undefined) {
    if (!ref) {
      this.cashFlowChart?.destroy();
      this.cashFlowChart = undefined;
      this.cashFlowCanvas = undefined;
      return;
    }

    this.cashFlowCanvas = ref.nativeElement;
    this.updateCashFlowChart();
  }

  selectCashFlow(model: 'suggested' | 'floor' | 'evaluated'): void {
    if (!this.isDetailed) return;
    if (model === 'evaluated' && !this.priceEvaluationResult) return;
    this.selectedCashFlow = model;
    this.updateCashFlowChart();
  }

  private getSelectedEvaluation(): EvaluationResult | null {
    if (this.selectedCashFlow === 'evaluated') {
      return this.priceEvaluationResult ?? null;
    }
    if (!this.pricingResult) return null;
    return this.pricingResult[this.selectedCashFlow];
  }

  private updateCashFlowChart(): void {
    if (!this.isDetailed) {
      this.cashFlowChart?.destroy();
      this.cashFlowChart = undefined;
      return;
    }
    if (!this.cashFlowCanvas || !this.pricingResult) {
      return;
    }
    const evaluation = this.getSelectedEvaluation();
    if (!evaluation) return;
    const periods = evaluation.financial_cashflow?.periods ?? [];
    const labels = periods.map(item => `M${item.period}`);
    const VpnValues = periods.map(item => Number(item.vpn));
    const FclValues = periods.map(item => Number(item.discounted_fcl));

    if (this.cashFlowChart) {
      this.cashFlowChart.data.labels = labels;
      // Dataset 0: barras FCL
      this.cashFlowChart.data.datasets[0].data = FclValues;
      // Dataset 1: línea VPN acumulado
      this.cashFlowChart.data.datasets[1].data = VpnValues;
      // Actualizar colores de las barras según el signo del FCL
      this.cashFlowChart.data.datasets[0].backgroundColor = FclValues.map(value =>
        value >= 0
          ? 'rgba(59, 130, 246, 0.30)'
          : 'rgba(239, 68, 68, 0.30)'
      );
      this.cashFlowChart.data.datasets[0].borderColor = FclValues.map(value =>
        value >= 0 ? '#3b82f6' : '#ef4444'
      );
      this.cashFlowChart.update();
      return;
    }

    this.cashFlowChart = new Chart(this.cashFlowCanvas, {
      type: 'bar',

    data: {
      labels,

      datasets: [
        {
          type: 'bar',
          label: 'FCL',
          data: FclValues,

          backgroundColor: FclValues.map(value =>
            value >= 0
              ? 'rgba(59, 130, 246, 0.30)'
              : 'rgba(239, 68, 68, 0.30)'
          ),

          borderColor: FclValues.map(value =>
            value >= 0 ? '#3b82f6' : '#ef4444'
          ),

          borderWidth: 1,
          borderRadius: 4,
          order: 2
        },
        {
          type: 'line',
          label: 'VPN acumulado',
          data: VpnValues,

          borderColor: '#22c55e',
          borderWidth: 2.5,
          tension: 0.3,

          pointRadius: 3,
          pointHoverRadius: 6,

          fill: {
            target: 'origin',
            above: 'rgba(34, 197, 94, 0.12)',
            below: 'rgba(239, 68, 68, 0.12)'
          },

          segment: {
            borderColor: context => {
              const value = context.p1.parsed.y;
              return value !== null && value >= 0
                ? '#22c55e'
                : '#ef4444';
            }
          },

          order: 1
        }
      ]
    },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          intersect: false,
          mode: 'index'
        },

        plugins: {
          legend: {
            display: true,
            position: 'top'
          },

          tooltip: {
            callbacks: {
              label: context => {
                const value = context.parsed.y;
                if (value === null) return 'Sin información';
                return `${context.dataset.label}: ${new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0
                }).format(value)}`;
              }
            }
          }
        },

        scales: {
          x: {
            title: {
              display: true,
              text: 'Periodo'
            }
          },

          y: {
            title: {
              display: true,
              text: 'VPN acumulado (COP)'
            },

            ticks: {
              callback: value =>
                new Intl.NumberFormat('es-CO', {
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(Number(value))
            }
          }
        }
      }
    });
  }

  @ViewChild('priceComparisonChart')
  set priceComparisonChartCanvas(
    ref: ElementRef<HTMLCanvasElement> | undefined
  ) {
    if (!ref) {
      this.priceComparisonChart?.destroy();
      this.priceComparisonChart = undefined;
      this.priceComparisonCanvas = undefined;
      return;
    }

    this.priceComparisonCanvas = ref.nativeElement;
  }

  get priceMarkers(): PriceMarker[] {
    const comparison = this.pricingResult?.price_comparison;
    if (!comparison) return [];
    const references = [
      {
        key: 'median',
        label: 'Mediana',
        value: comparison.market_median,
        colorClass: 'marker-median'
      },
      {
        key: 'average',
        label: 'Promedio',
        value: comparison.market_average,
        colorClass: 'marker-average'
      },
      {
        key: 'breakeven',
        label: 'Breakeven',
        value: comparison.breakeven,
        colorClass: 'marker-floor'
      },
      {
        key: 'ml',
        label: 'Precio ML',
        value: comparison.ml_price,
        colorClass: 'marker-ml'
      },
      {
        key: 'special',
        label: 'Tarifa especial',
        value: comparison.tariff_special,
        colorClass: 'marker-special'
      },
      {
        key: 'discount',
        label: 'Tarifa descuento',
        value: comparison.tariff_discount,
        colorClass: 'marker-discount'
      },
      {
        key: 'base',
        label: 'Tarifa base',
        value: comparison.tariff_base,
        colorClass: 'marker-base'
      }
    ];

    const valid = references
    .map(item => ({
      ...item,
      value: item.value == null ? null : Number(item.value)
    }))
    .filter(
      (item): item is typeof item & { value: number } =>
        item.value !== null &&
        Number.isFinite(item.value) &&
        item.value >= 0
    );

    if (!valid.length) return [];

    const min = Math.min(...valid.map(item => item.value));
    const max = Math.max(...valid.map(item => item.value));
    const range = max - min;

    return valid
      .map((item, index) => ({
        ...item,
        value: item.value!,
        position: range === 0
          ? 50
          : ((item.value - min) / range) * 100,
        lane: item.key === 'breakeven'
          ? 'below'
          : (index % 2 === 0 ? 'top' : 'bottom') as 'top' | 'bottom' | 'below'
      }))
      .sort((a, b) => a.value - b.value);
  }

  get priceRange(): { min: number; max: number } | null {
    const markers = this.priceMarkers;

    if (!markers.length) return null;
    
    return {
      min: markers[0].value,
      max: markers[markers.length - 1].value
    };
  }

  get priceSegments(): PriceSegment[] {
    const markers = this.priceMarkers;
    const range = this.priceRange;

    if (!range || !markers.length) return [];

    const { min, max } = range;

    if (min === max) {
      return [{ colorClass: 'segment-gray', width: 100 }];
    }

    const comparison = this.pricingResult!.price_comparison;

    // Normalizar valores recibidos como string o number
    const breakeven = comparison.breakeven == null
      ? null
      : Number(comparison.breakeven);

    const mlPrice = comparison.ml_price == null
      ? null
      : Number(comparison.ml_price);

    const tariffDiscount = comparison.tariff_discount == null
      ? null
      : Number(comparison.tariff_discount);

    const boundaries = [
      min,
      breakeven,
      mlPrice,
      tariffDiscount,
      max
    ]
      .filter((value): value is number =>
        value !== null &&
        Number.isFinite(value) &&
        value >= min &&
        value <= max
      );

    const unique = [...new Set(boundaries)].sort((a, b) => a - b);

    return unique.slice(1).map((value, index) => {
      const midpoint = (unique[index] + value) / 2;

      let colorClass = 'segment-gray';

      if (breakeven !== null && Number.isFinite(breakeven) && midpoint <= breakeven) {
        colorClass = 'segment-red';
      } else if (mlPrice !== null && Number.isFinite(mlPrice) && midpoint <= mlPrice) {
        colorClass = 'segment-orange';
      } else if (
        tariffDiscount !== null &&
        Number.isFinite(tariffDiscount) &&
        midpoint <= tariffDiscount
      ) {
        colorClass = 'segment-teal';
      }

      return {
        colorClass,
        width: ((value - unique[index]) / (max - min)) * 100
      };
    });
  }

  detectLabelOverlaps(): void {
    const markers = Array.from(
      document.querySelectorAll<HTMLElement>('.price-marker')
    );

    const labels = markers.map(marker => {
      const label = marker.querySelector<HTMLElement>(
        '.price-marker-label'
      )!;

      return {
        marker,
        label,
        originalLane: marker.dataset['lane'] ?? 'top',
        rect: label.getBoundingClientRect()
      };
    });

    // Carriles disponibles y sus intervalos ocupados
    const lanes = new Map<string, Array<{ left: number; right: number }>>();

    const rowGap = 46;
    const belowBase = 228;

    let maxBelowRow = -1;

    const fits = (
      lane: string,
      left: number,
      right: number
    ): boolean => {
      const occupied = lanes.get(lane) ?? [];

      return occupied.every(interval =>
        right <= interval.left || left >= interval.right
      );
    };

    const occupy = (
      lane: string,
      left: number,
      right: number
    ): void => {
      if (!lanes.has(lane)) {
        lanes.set(lane, []);
      }

      lanes.get(lane)!.push({ left, right });
    };

    labels.forEach(({ marker, label, originalLane, rect }) => {
      const left = rect.left;
      const right = rect.right;

      // Priorizar el carril original y después el alternativo
      const preferred = originalLane === 'bottom'
        ? ['bottom', 'top']
        : originalLane === 'below'
          ? []
          : ['top', 'bottom'];

      let assignedLane: string | null = null;

      // 1. Intentar arriba o abajo
      for (const lane of preferred) {
        if (fits(lane, left, right)) {
          assignedLane = lane;
          break;
        }
      }

      // 2. Si no cabe, buscar una fila below disponible
      if (!assignedLane) {
        let row = 0;

        while (!fits(`below-${row}`, left, right)) {
          row++;
        }

        assignedLane = `below-${row}`;
        maxBelowRow = Math.max(maxBelowRow, row);

        label.style.top = `${belowBase + row * rowGap}px`;
      } else {
        label.style.top = '';
      }

      occupy(assignedLane, left, right);

      // Aplicar carril visual
      marker.classList.remove(
        'lane-top',
        'lane-bottom',
        'lane-below'
      );

      if (assignedLane.startsWith('below-')) {
        marker.classList.add('lane-below');
      } else {
        marker.classList.add(`lane-${assignedLane}`);
      }

    });
  }

  get marketSourceLabel(): string {
    const source = this.pricingResult?.price_comparison?.source;

    switch (source?.toLowerCase()) {
      case 'dept':
      case 'department':
        return 'Departamental';

      case 'mun':
      case 'municipality':
        return 'Municipal';

      case 'national':
      case 'country':
        return 'Nacional';

      default:
        return 'Sin cobertura definida';
    }
  }

  get marketSampleSize(): number | null {
    return this.pricingResult?.price_comparison?.sample_size ?? null;
  }

  openCashFlowDetail(model: 'suggested' | 'floor' | 'evaluated'): void {
    const evaluation = model === 'evaluated'
      ? this.priceEvaluationResult
      : this.pricingResult?.[model];

    if (!evaluation?.financial_cashflow?.periods) return;

    this.selectedCashFlowDetail = model;
    this.showCashFlowDetail = true;
  }

  closeCashFlowDetail(): void {
    this.showCashFlowDetail = false;
  }

  getSelectedCashFlow(): EvaluationResult | null {
    if (this.selectedCashFlowDetail === 'evaluated') {
      return this.priceEvaluationResult ?? null;
    }
    if (!this.pricingResult) return null;
    return this.pricingResult[this.selectedCashFlowDetail];
  }
}