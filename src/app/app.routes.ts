import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';

import { authGuard } from './guards/auth-guard';
import { areaGuard } from './guards/area-guard'

import { Main } from './pages/main/main';
import { Client } from './pages/client/client';
import { FinancialVariables } from './pages/financial-variables/financial-variables';
import { PricingSites } from './pages/pricing-sites/pricing-sites'; 

import { ChangePassword } from './pages/change-password/change-password';


import { Evaluator } from './pages/evaluator/evaluator';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'main',
        component: Main
      },
      {
        path: 'client',
        component: Client,
        canActivate: [
          areaGuard('pricing', 'retencion', 'ventas')
        ]
      },
      {
        path: 'pricing-variables',
        component: FinancialVariables,
        canActivate: [
          areaGuard('pricing', 'ventas')
        ]
      },
      {
        path: 'pricing-sites',
        component: PricingSites,
        canActivate: [
          areaGuard('ventas', 'pricing')
        ]
      },
      {
        path: 'evaluator',
        component: Evaluator,
        canActivate: [
          areaGuard('pricing', 'ventas')
        ]
      },
      {
        path: 'change-password',
        component: ChangePassword
      },
    ]
  },
  
  
];
//
// EOF
//