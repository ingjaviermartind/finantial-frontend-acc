import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  ProductCatalog,
} from '../models/product-catalog';

@Injectable({
  providedIn: 'root',
})

export class ProductCatalogService {
  private baseUrl = `${environment.apiUrl}/product_catalog/`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<ProductCatalog[]> {
    return this.http.get<ProductCatalog[]>(this.baseUrl);
  }
}
