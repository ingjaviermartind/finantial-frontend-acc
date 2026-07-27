import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { UserService } from './user';
import { tap } from 'rxjs/operators';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = `${environment.apiUrl}/token/`;
  private refreshUrl = `${environment.apiUrl}/token/refresh/`
  constructor(
    private http: HttpClient, 
    private router : Router, 
    private UserService : UserService
  ) {}
  login(username: string, password: string) {
    return this.http.post<LoginResponse>(
      this.apiUrl,
      {
        username,
        password
      }
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }
  private saveSession(response: LoginResponse): void {
    this.setAccessToken(response.access);
    this.setRefreshToken(response.refresh);
    this.UserService.setUser(response.user);
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
    this.UserService.clearUser();
    this.router.navigate(['/login']);
  }
  changePassword(
    currentPassword: string,
    newPassword: string
  ) {
    return this.http.post(
      `${environment.apiUrl}/change-password/`,
      {
        current_password: currentPassword,
        new_password: newPassword
      }
    );
  }
}
