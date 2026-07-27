import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { FinancialVariable } from '../models/financial-variable';

@Injectable({
  providedIn: 'root'
})
export class FinancialVariableService {

  private apiUrl = `${environment.apiUrl}/financial-variables/`;

  constructor(
    private http: HttpClient
  ) {}

  getVariables(): Observable<FinancialVariable[]> {
    return this.http.get<FinancialVariable[]>(
      this.apiUrl
    );
  }

  updateVariable(
    id: number,
    value: number
  ){
      return this.http.patch<FinancialVariable>(
          `${this.apiUrl}${id}/`,
          {
              value
          }
      );
  }

}