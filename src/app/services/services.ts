import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServicesResponse } from '../models/services';
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
}
