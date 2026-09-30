import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServicesFilters, ServicesResponse } from '../models/services';
@Injectable({
  providedIn: 'root',
})

export class Services {
  private baseUrl = `${environment.apiUrl}/services/`;
  constructor(private http: HttpClient) {}
  getByMunicipality(id: string): Observable<ServicesResponse> {
    return this.http.get<ServicesResponse>(
      `${this.baseUrl}${id}/`
    );
  }
  getByMunicipalities(filters: ServicesFilters): Observable<ServicesResponse> 
  {
    let params = new HttpParams();
    Object.entries(filters).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined
        ) {
          return;
        }
        if (Array.isArray(value)) {
          value.forEach(item => {
            params = params.append(
              key,
              item
            );
          });
        } else {
          params = params.set(
            key,
            value
          );
        }
      }
    );
    return this.http.get<ServicesResponse>(
      this.baseUrl,
      { params }
    );
  }
}
