import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Main } from './pages/main/main';
import { EvaluadorFinanciero } from './pages/evaluador-financiero/evaluador-financiero';
import { Cotizaciones } from './pages/cotizaciones/cotizaciones';


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
      }
    ]
  }
];
//
// EOF
//