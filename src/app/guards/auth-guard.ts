import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth'

export const authGuard : CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  const token = localStorage.getItem('access_token');
  if (token) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
