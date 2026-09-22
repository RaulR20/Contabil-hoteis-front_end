import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Pagamentos } from './pages/pagamentos/pagamentos';
import { Reservas } from './pages/reservas/reservas';
import { Checkin } from './pages/checkin/checkin';
import { Hospedes } from './pages/hospedes/hospedes';
import { FechamentoCaixa } from './pages/fechamento-caixa/fechamento-caixa';
import { Faturamento } from './pages/faturamento/faturamento';
import { FluxoCaixa } from './pages/fluxo-caixa/fluxo-caixa';
import { Relatorios } from './pages/relatorios/relatorios';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: Home },
      { path: 'reservas', component: Reservas },
      { path: 'checkin', component: Checkin },
      { path: 'hospedes', component: Hospedes },
      { path: 'fluxo-caixa', component: FluxoCaixa },
      { path: 'faturamento', component: Faturamento },
      { path: 'pagamentos', component: Pagamentos },
      { path: 'fechamento-caixa', component: FechamentoCaixa },
      { path: 'relatorios', component: Relatorios },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
