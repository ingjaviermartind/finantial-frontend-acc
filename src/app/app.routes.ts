import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { MainLayout } from './layouts/main-layout/main-layout';

import { authGuard } from './guards/auth-guard';
import { areaGuard } from './guards/area-guard'

import { Main } from './pages/main/main';
import { EvaluadorFinanciero } from './pages/evaluador-financiero/evaluador-financiero';
import { Cotizaciones } from './pages/cotizaciones/cotizaciones';
import { FinancialVariables } from './pages/financial-variables/financial-variables';
import { PricingSites } from './pages/pricing-sites/pricing-sites'; 

import { ChangePassword } from './pages/change-password/change-password';

import { Presales } from './pages/presales/presales';
import { PreventaVariables } from './pages/preventa-variables/preventa-variables';
import { FeasibilityLayout } from './layouts/feasibility-layout/feasibility-layout';

import { Upload } from './pages/presales/upload/upload';
import { Viability } from './pages/presales/viability/viability';
import { Costs } from './pages/presales/costs/costs';
import { Export } from './pages/presales/export/export';


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
        path: 'evaluator',
        component: EvaluadorFinanciero,
        canActivate: [
          areaGuard('pricing')
        ]
      },
      {
        path: 'quotes',
        component: Cotizaciones
      },
      {
        path: 'pricing-variables',
        component: FinancialVariables,
        canActivate: [
          areaGuard('pricing')
        ]
      },
      {
        path: 'pricing-sites',
        component: PricingSites,
        canActivate: [
          areaGuard('pricing')
        ]
      },
      {
        path: 'pre-sales',
        component: Presales,
        canActivate: [
          areaGuard('preventa')
        ]
      },
      {
        path: 'preventa-variables',
        component: PreventaVariables,
        canActivate: [
          areaGuard('preventa')
        ]
      },
      {
        path: 'change-password',
        component: ChangePassword
      },
      {
        path: 'feasibility',
        component: FeasibilityLayout,
        canActivate: [
          areaGuard('preventa')
        ],
        children: [
          {
            path: '',
            redirectTo: 'upload',
            pathMatch: 'full'
          },

          {
            path: 'upload',
            component: Upload
          },

          {
            path: 'viability',
            component: Viability
          },

          {
            path: 'costs',
            component: Costs
          },

          {
            path: 'export',
            component: Export
          }
        ]
      }

    ]
  },
  
  
];
//
// EOF
//