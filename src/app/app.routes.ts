import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Login } from './pages/login/login';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/home/home').then((page) => page.Home) },
      { path: 'reservas', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/reservas/reservas').then((page) => page.Reservas) },
      { path: 'checkin', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/checkin/checkin').then((page) => page.Checkin) },
      { path: 'hospedes', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/hospedes/hospedes').then((page) => page.Hospedes) },
      { path: 'fluxo-caixa', canActivate: [roleGuard], data: { roles: ['ADMIN', 'MANAGER', 'CASHIER'] }, loadComponent: () => import('./pages/fluxo-caixa/fluxo-caixa').then((page) => page.FluxoCaixa) },
      { path: 'faturamento', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/faturamento/faturamento').then((page) => page.Faturamento) },
      { path: 'pagamentos', canActivate: [roleGuard], data: { roles: ['ADMIN', 'MANAGER'] }, loadComponent: () => import('./pages/pagamentos/pagamentos').then((page) => page.Pagamentos) },
      { path: 'fechamento-caixa', canActivate: [roleGuard], data: { roles: ['ADMIN', 'MANAGER'] }, loadComponent: () => import('./pages/fechamento-caixa/fechamento-caixa').then((page) => page.FechamentoCaixa) },
      { path: 'relatorios', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/relatorios/relatorios').then((page) => page.Relatorios) },
      { path: 'usuarios', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/usuarios/usuarios').then((page) => page.Usuarios) },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
