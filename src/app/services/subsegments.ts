import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Subsegment } from '../models/subsegment';

@Injectable({
  providedIn: 'root',
})
export class ClientSubsegmentService {
  private baseUrl = `${environment.apiUrl}/subsegments/`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<Subsegment[]> {
    return this.http.get<Subsegment[]>(this.baseUrl);
  }
}