import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ClientsState } from '../../services/clients-state';
import { PricingService } from '../../services/pricing';
import { ActiveService, SelectedDaneLocation } from '../../models/services';
import { PricingRequest, PricingResponse, EvaluationResult} from '../../models/pricing';

import { EvaluatorSidebar } from '../../components/evaluator-sidebar/evaluator-sidebar';

import { CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';

import { municipality } from '../../models/location';


interface PriceMarker {
  key: string;
  label: string;
  value: number;
  position: number;
  colorClass: string;
  alignment: 'start' | 'center' | 'end';
}

interface PriceSegment {
  colorClass: string;
  width: number;
}


@Component({
  selector: 'app-evaluacion-servicio',
  imports: [
    EvaluatorSidebar,
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    PercentPipe
  ],
  standalone: true,
  templateUrl: './evaluator.html',
  styleUrl: './evaluator.scss',
})
export class Evaluator {
  isFiltersExpanded = true;
  loadingCalculation = false;
  loadingPriceEvaluation = false;
  pricingResult: PricingResponse | undefined;
  priceToEvaluate: number | null = null;

  priceEvaluationResult: EvaluationResult | undefined;
  private lastPricingRequest: PricingRequest | undefined;

  selectedMunicipality: municipality | null = null;

  constructor(
    private clientsState: ClientsState,
    private pricingService : PricingService
  ) {}

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
    this.lastPricingRequest = {...request};
    this.clientsState.saveEvaluationRequest(request);
    this.pricingResult = undefined;
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
    this.pricingService.evaluatePrice(request).pipe(
      finalize(() => {
        this.loadingPriceEvaluation = false;
      })
    ).subscribe({
      next: response => {
        this.priceEvaluationResult = response;
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
  }

  get isDetailed(): boolean {
    const suggested = this.pricingResult?.suggested;
    return suggested?.capex != null && suggested?.opex_m != null;
  }

  get priceMarkers(): PriceMarker[] {
    const r = this.pricingResult;
    if (!r) return [];

    const references = [
      { key: 'floor', label: 'Piso Breakeven', value: r.floor?.price_per_mbps, colorClass: 'marker-floor' },
      { key: 'ml', label: '★ Sugerido ML', value: r.predicted?.price_per_mbps, colorClass: 'marker-ml' },
      { key: 'average', label: 'Promedio', value: r.mean_price_mbps, colorClass: 'marker-average' },
      { key: 'median', label: 'Mediana', value: r.median_price_mbps, colorClass: 'marker-median' },
      { key: 'special', label: 'T. Especial', value: r.ref_price_mbps_special, colorClass: 'marker-special' },
      { key: 'discount', label: 'T. Descuento', value: r.ref_price_mbps_dis, colorClass: 'marker-discount' },
      { key: 'base', label: 'Tarifa Base', value: r.ref_price_mbps, colorClass: 'marker-base' }
    ];

    const valid = references.filter(
      item => typeof item.value === 'number' &&
        Number.isFinite(item.value) &&
        item.value >= 0
    );

    if (!valid.length) return [];

    const min = Math.min(...valid.map(x => x.value));
    const max = Math.max(...valid.map(x => x.value));
    const range = max - min;

    return valid.map(item => {
      const position = range === 0
        ? 50
        : ((item.value - min) / range) * 100;

      return {
        ...item,
        value: item.value,
        position,
        alignment: (
          position < 8 ? 'start' :
          position > 92 ? 'end' : 'center'
        ) as 'start' | 'center' | 'end'
      };
    }).sort((a, b) => a.value - b.value);
  }

  get priceSegments(): PriceSegment[] {
    const markers = this.priceMarkers;
    if (!markers.length) return [];

    const min = markers[0].value;
    const max = markers[markers.length - 1].value;

    if (min === max) {
      return [{ colorClass: 'segment-red', width: 100 }];
    }

    const floor = this.pricingResult?.floor?.price_per_mbps;
    const ml = this.pricingResult?.predicted?.price_per_mbps;
    const discount = this.pricingResult?.ref_price_mbps_dis;

    const thresholds = [floor, ml, discount]
      .filter((v): v is number =>
        typeof v === 'number' &&
        Number.isFinite(v) &&
        v > min &&
        v < max
      );

    const boundaries = [
      min,
      ...new Set(thresholds),
      max
    ].sort((a, b) => a - b);

    const colors = [
      'segment-red',
      'segment-orange',
      'segment-teal',
      'segment-gray'
    ];

    return boundaries.slice(1).map((value, i) => ({
      colorClass: colors[Math.min(i, 3)],
      width: ((value - boundaries[i]) / (max - min)) * 100
    }));
  }

  get priceRange(): { min: number; max: number } | null {
    const markers = this.priceMarkers;

    return markers.length
      ? {
          min: markers[0].value,
          max: markers[markers.length - 1].value
        }
      : null;
  }
}