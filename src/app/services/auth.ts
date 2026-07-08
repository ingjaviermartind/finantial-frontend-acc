import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  //private apiUrl = `${environment.apiUrl}/token/`;
  private apiUrl = `${environment.apiUrl}/token/`;
  private refreshUrl = `${environment.apiUrl}/token/refresh/`
  constructor(private http: HttpClient, private router : Router) {}
  login(username: string, password: string) {
    return this.http.post(this.apiUrl, {
      username,
      password
    });
  }
  refreshToken() {
    const refresh = localStorage.getItem('refresh_token')
    return this.http.post<{
      access: string
    }>(
      this.refreshUrl,{
        refresh
      }
    );
  }
  getAccessToken(): string | null {
    return localStorage.getItem(
      'access_token'
    );
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(
      'refresh_token'
    );
  }
  setAccessToken(token : string) : void {
    localStorage.setItem(
      'access_token',
      token
    )
  }
  setRefreshToken(token : string) : void {
    localStorage.setItem(
      'refresh_token',
      token
    )
  }
  logout(): void {
    localStorage.removeItem(
      'access_token'
    );
    localStorage.removeItem(
      'refresh_token'
    );
    this.router.navigate(['/login']);
  }
}
