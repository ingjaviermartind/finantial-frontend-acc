import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { department } from '../models/location';

@Injectable({
  providedIn: 'root',
})

export class Department {
  private baseUrl = `${environment.apiUrl}/department/`;

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<department[]> {
    return this.http.get<department[]>(this.baseUrl);
  }
}
