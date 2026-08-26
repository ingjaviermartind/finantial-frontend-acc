import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientSubsegmentService {
  private baseUrl = `${environment.apiUrl}/subsegments/`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl);
  }
}