import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class Municipality {
  private baseUrl = `${environment.apiUrl}/municipalities/`;
  constructor(private http: HttpClient) {}
  getByDepartment (departmentId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}?department=${departmentId}`
    );
  }
}
