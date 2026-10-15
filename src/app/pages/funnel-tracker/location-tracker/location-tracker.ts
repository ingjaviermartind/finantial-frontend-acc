import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { FunnelTrackerService } from '../../../services/funnel-tracker';
import {
  FunnelTrackerResponse,
  MetricValue,
  CrossedActiveService
} from '../../../models/funnel-tracker';

@Component({
  selector: 'app-location-tracker',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './location-tracker.html',
  styleUrl: './location-tracker.scss',
})
export class LocationTracker implements OnInit {
  data: FunnelTrackerResponse | null = null;

  isLoading = false;
  errorMessage: string | null = null;

  expandedServices = new Set<string>();

  constructor(
    private funnelTrackerService: FunnelTrackerService
  ) {}

  ngOnInit(): void {
    this.loadTracker();
  }

  loadTracker(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.funnelTrackerService
      .getTrackerData(100)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: response => {
          this.data = response;
        },
        error: err => {
          console.error('Error cargando Location Tracker:', err);

          this.errorMessage =
            err.error?.detail ??
            'No fue posible cargar la información de Location Tracker.';
        },
      });
  }

  toggleService(service: CrossedActiveService): void {
    const ser = service.active_service_ser;
    const next = new Set(this.expandedServices);

    if (next.has(ser)) {
      next.delete(ser);
    } else {
      next.add(ser);
    }

    this.expandedServices = next;
  }

  isServiceExpanded(service: CrossedActiveService): boolean {
    return this.expandedServices.has(service.active_service_ser);
  }

  private toNumber(value: MetricValue | undefined): number {
    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue)
      ? numberValue
      : 0;
  }

  get totalSites(): number {
    return this.toNumber(
      this.data?.metrics.locations.Total_Sedes
    );
  }

  get viableSites(): number {
    return this.toNumber(
      this.data?.metrics.locations.Sedes_Viables
    );
  }

  get feasibilityPct(): number {
    const storedValue =
      this.data?.metrics.locations.Razon_Viabilidad_Pct;

    return storedValue != null
      ? this.toNumber(storedValue)
      : this.totalSites > 0
        ? (this.viableSites / this.totalSites) * 100
        : 0;
  }

  get viableSitesWithCoordinates(): number {
    return this.toNumber(
      this.data?.metrics.locations.Sedes_Viables_Con_Coordenadas
    );
  }

  get viableCoordinatesPct(): number {
    const storedValue =
      this.data?.metrics.locations.Razon_Viables_Con_Coordenadas_Pct;

    return storedValue != null
      ? this.toNumber(storedValue)
      : this.viableSites > 0
        ? (this.viableSitesWithCoordinates / this.viableSites) * 100
        : 0;
  }

  get matchedPairs(): number {
    return this.toNumber(
      this.data?.metrics.proximity.matched_pairs
    );
  }

  get sitesWithMatches(): number {
    return this.toNumber(
      this.data?.metrics.proximity.sites_with_matches
    );
  }

  get matchedServices(): number {
    return this.toNumber(
      this.data?.metrics.proximity.services_matched
    );
  }


  get crossedServicesMrc(): number {
    const uniqueServices = new Map<string, number>();
    for (const service of this.data?.services_with_nearby_sites ?? []) {
      if (!uniqueServices.has(service.active_service_ser)) {
        uniqueServices.set(
          service.active_service_ser,
          this.toNumber(service.service_tariff)
        );
      }
    }
    return [...uniqueServices.values()].reduce(
      (total, tariff) => total + tariff,
      0
    );
  }

  get totalServices(): number {
    return this.toNumber(
      this.data?.metrics.services.Total_Servicios
    );
  }

  get servicesWithCoordinates(): number {
    return this.toNumber(
      this.data?.metrics.services.Servicios_Con_Coordenadas
    );
  }

  get servicesWithCoordinatesPct(): number {
    return this.toNumber(
      this.data?.metrics.services.Razon_Servicios_Con_Coordenadas_Pct
    );
  }
}