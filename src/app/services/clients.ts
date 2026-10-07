import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ClientOption } from '../models/services';

@Injectable({
  providedIn: 'root',
})
export class ActiveClientsService {

  private baseUrl = `${environment.apiUrl}/clients/active/`;

  constructor(private http: HttpClient) {}

  getActiveClients(): Observable<ClientOption[]> {
    return this.http.get<ClientOption[]>(
      this.baseUrl
    );
  }
}