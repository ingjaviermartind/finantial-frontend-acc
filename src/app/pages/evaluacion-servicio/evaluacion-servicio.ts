import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ClientsState } from '../../services/clients-state';
import { PricingService } from '../../services/pricing';
import { ActiveService } from '../../models/services';
import { PricingRequest, PricingResponse, EvaluationResult} from '../../models/pricing';

import { EvaluacionServicioSidebar } from '../../components/evaluacion-servicio-sidebar/evaluacion-servicio-sidebar';

import { CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';



@Component({
  selector: 'app-evaluacion-servicio',
  imports: [
    EvaluacionServicioSidebar,
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    PercentPipe
  ],
  standalone: true,
  templateUrl: './evaluacion-servicio.html',
  styleUrl: './evaluacion-servicio.scss',
})
export class EvaluacionServicio {
  isFiltersExpanded = true;
  loadingCalculation = false;
  loadingPriceEvaluation = false;
  pricingResult: PricingResponse | undefined;
  priceToEvaluate: number | null = null;

  priceEvaluationResult: EvaluationResult | undefined;
  private lastPricingRequest: PricingRequest | undefined;
  
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

  get selectedDaneServices() : ActiveService[] {
    const service = this.clientsState.selectedService;
    return service ? [service] : [];
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
}