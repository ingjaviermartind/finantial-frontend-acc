import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PricingSitesFilters,
  PricingSitesResponse
} from '../models/pricing-site';

@Injectable({
  providedIn: 'root',
})
export class PricingSitesService {

  private baseUrl = `${environment.apiUrl}/pricing-sites/`;

  constructor(private http: HttpClient) {}

  getPricingSites(filters: PricingSitesFilters): Observable<PricingSitesResponse> 
  {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if(value === null || value === undefined)
        return;
      if (Array.isArray(value))
      {
        value.forEach( item => {
          params = params.append(key, item);
        });
      } else {
        params = params.set(key, value);
      }
    });
    console.log('FILTERS:', filters);
    console.log('PARAMS:', params.toString());
    return this.http.get<PricingSitesResponse>(
      this.baseUrl,
      { params }
    );
  }
}