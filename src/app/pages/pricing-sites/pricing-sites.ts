import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PricingSitesSidebar } from '../../components/pricing-sites-sidebar/pricing-sites-sidebar';
import { PricingSitesService } from '../../services/pricing-site';
import {
  PricingSite,
  PricingSitesFilters,
  PricingSitesResponse,
  PricingFunnelGroup
} from '../../models/pricing-site';

import { finalize } from 'rxjs';

@Component({
  selector: 'app-pricing-sites',
  standalone: true,
  imports: [
    CommonModule,
    PricingSitesSidebar
  ],
  templateUrl: './pricing-sites.html',
  styleUrl: './pricing-sites.scss'
})
export class PricingSites {

  readonly pageSize = 10;
  isPaging = false;
  currentPage = 1;
  totalPages = 0;
  currentFilters!: PricingSitesFilters;

  funnels: PricingFunnelGroup[] = [];

  funnelCount = 0;
  siteCount = 0;

  constructor(
    private pricingSitesService: PricingSitesService
  ) {}

  onPricingSitesLoaded(response: PricingSitesResponse): void {
    this.funnelCount = response['funnel count'];
    this.siteCount = response['sedes count'];
    this.currentPage = response.page;
    this.totalPages = response.total_pages;
    this.funnels = this.groupByFunnel(response.results).sort((a, b) => b.mrcTotal - a.mrcTotal);;
  }
  onFiltersChanged(filters: PricingSitesFilters): void {
    this.currentFilters = filters;
  }

  private groupByFunnel(
    sites: PricingSite[]
  ): PricingFunnelGroup[] {
    const groups = new Map<string, PricingSite[]>();
    for (const site of sites) {
      if (!groups.has(site.FUNNEL)) {
        groups.set(site.FUNNEL, []);
      }
      groups.get(site.FUNNEL)!.push(site);
    }
    return Array.from(groups.values())
      .map(sites => {
          sites.sort(
          (a, b) =>
            (b.MRC_PROMEDIO ?? 0) - (a.MRC_PROMEDIO ?? 0)
        );

        return new PricingFunnelGroup(sites);
      }).sort(
        (a, b) => b.mrcTotal - a.mrcTotal
      );
  }
  toggleFunnel(funnel: PricingFunnelGroup): void {
    funnel.expanded = !funnel.expanded;
  }

  private loadPage(filters: PricingSitesFilters): void {
    this.pricingSitesService
      .getPricingSites(filters)
      .pipe(
        finalize(() => {
          this.isPaging = false;
        })
      )
      .subscribe({
        next: response => {
          this.onPricingSitesLoaded(response);
        },

        error: error => {
          console.error(
            'Error consultando página:',
            error
          );
        }
      });
  }
  goToPage(page: number): void {
    if (
      !this.currentFilters ||
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }
    this.isPaging = true;
    const filters: PricingSitesFilters = {
      ...this.currentFilters,
      page
    };
    this.loadPage(filters);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

}