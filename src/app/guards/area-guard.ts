import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user';

export const areaGuard = (...areas: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const userService = inject(UserService);
    const hasAccess = areas.some(
      area => userService.hasArea(area)
    );
    if (hasAccess) {
      return true;
    }

    const routes: Record<string, string> = {
      ventas: '/evaluator',
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