import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PricingSitesFilterOptions } from '../models/pricing-site';
@Injectable({
  providedIn: 'root',
})
export class PricingSiteFilterOptionsService {
  private baseUrl =`${environment.apiUrl}/pricing-sites/filter-options/`;
  constructor(private http: HttpClient) {}
  getFilterOptions(
    periodValue: number,
    periodUnit: string,
    departments: string[],
    municipalities: string[],
    productFamilies: string[],
    products: string[]
  ) {
    let params = new HttpParams()
      .set('period_value', periodValue)
      .set('period_unit', periodUnit);

    if (departments.length > 0) {
      params = params.set(
        'departments',
        departments.join(',')
      );
    }

    if (municipalities.length > 0) {
      params = params.set(
        'municipalities',
        municipalities.join(',')
      );
    }

    if (productFamilies.length > 0) {
      params = params.set(
        'product_families',
        productFamilies.join(',')
      );
    }

    if (products.length > 0) {
      params = params.set(
        'products',
        products.join(',')
      );
    }

    return this.http.get<PricingSitesFilterOptions>(
      this.baseUrl,
      { params }
    );
  }
}