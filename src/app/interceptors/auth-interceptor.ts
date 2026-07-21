import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Auth } from '../services/auth';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  
  const auth = inject(Auth);
  const token = auth.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (![401, 403].includes(error.status)) {
        return throwError(() => error);
      }
      if (req.url.includes('/token/refresh/')) {
        auth.logout();
        return throwError(() => error);
      }
      return auth.refreshToken().pipe(
        switchMap((response : any) => {
          auth.setAccessToken(response.access);
          const newReq =req.clone({
            setHeaders:{
              Authorization: `Bearer ${response.access}`
            }
          });
          return next(newReq)
        }),
        catchError(refreshError => {
          auth.logout();
          return throwError(() => refreshError);
        })
      )
    })
  );
};