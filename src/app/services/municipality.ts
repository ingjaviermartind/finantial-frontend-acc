import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { municipality } from '../models/location';

@Injectable({
  providedIn: 'root',
})

export class Municipality {
  private baseUrl = `${environment.apiUrl}/municipalities/`;

  constructor(private http: HttpClient) {}

  getByDepartments(departmentIds: string[]): Observable<municipality[]> {
    let params = new HttpParams();
    if (departmentIds.length > 0) {
      params = params.set(
        'department',
        departmentIds.join(',')
      );
    }
    return this.http.get<municipality[]>(
      this.baseUrl,
      { params }
    );
  }
}
