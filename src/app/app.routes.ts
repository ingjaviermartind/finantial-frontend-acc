import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Main } from './pages/main/main';
import { EvaluadorFinanciero } from './pages/evaluador-financiero/evaluador-financiero';
import { Cotizaciones } from './pages/cotizaciones/cotizaciones';
import { FinancialVariables } from './pages/financial-variables/financial-variables';
import { ChangePassword } from './pages/change-password/change-password';

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
        component: EvaluadorFinanciero
      },
      {
        path: 'quotes',
        component: Cotizaciones
      },
      {
        path: 'variables',
        component: FinancialVariables
      },
      {
        path: 'change-password',
        component: ChangePassword
      }

    ]
  }
];
//
// EOF
//