import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';

import { authGuard } from './guards/auth-guard';
import { areaGuard } from './guards/area-guard'

import { Main } from './pages/main/main';
import { Client } from './pages/client/client';
import { FinancialVariables } from './pages/financial-variables/financial-variable';
import { PricingSites } from './pages/pricing-sites/pricing-sites'; 

import { ChangePassword } from './pages/change-password/change-password';


import { Evaluator } from './pages/financial-evaluator/evaluator/evaluator';


import { MainFunnelTracker } from './pages/funnel-tracker/main-funnel-tracker/main-funnel-tracker';
import { LocationTracker } from './pages/funnel-tracker/location-tracker/location-tracker';
import { MainFinancialEvaluator } from './pages/financial-evaluator/main-financial-evaluator/main-financial-evaluator';
import { Project } from './pages/financial-evaluator/project/project';

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
        path: 'financial-evaluator',
        component: MainFinancialEvaluator,
        canActivate: [
          areaGuard('pricing', 'ventas', 'retencion')
        ],
        children: [
          {
            path: '',
            redirectTo: 'fast-evaluation',
            pathMatch: 'full'
          },
          {
            path: 'fast-evaluation',
            component: Evaluator
          },
          {
            path: 'project-evaluation',
            component: Project
          }
        ]
      },
      {
        path: 'change-password',
        component: ChangePassword
      },
      {
        path: 'funnel-tracker',
        component: MainFunnelTracker,
        children: [
          {
            path: '',
            redirectTo: 'location-tracker',
            pathMatch: 'full'
          },
          {
            path: 'location-tracker',
            component: LocationTracker
          }
        ]
      },
    ]
  },
  
  
];
//
// EOF
//