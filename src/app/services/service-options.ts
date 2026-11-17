import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ServiceOption } from '../models/services';

@Injectable({
  providedIn: 'root',
})
export class ServiceOptionsService {

  private baseUrl = `${environment.apiUrl}/service-options/options/`;

  constructor(private http: HttpClient) {}

  getServiceOptions(): Observable<ServiceOption[]> {
    return this.http.get<ServiceOption[]>(
      this.baseUrl
    );
  }
}