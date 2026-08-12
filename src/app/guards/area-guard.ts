import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user';

export const areaGuard = (area: string): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const userService = inject(UserService);
    if (userService.hasArea(area)) {
      return true;
    }
    const routes: Record<string, string> = {
      pricing: '/evaluator',
      preventa: '/pre-sales',
      retencion: '/main'
    };

    const user = userService.getUser();
    const route = routes[user?.area ?? ''];

    return router.createUrlTree([
      route ?? '/main'
    ]);
  };
};