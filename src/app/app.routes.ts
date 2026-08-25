import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Pagamentos } from './pages/pagamentos/pagamentos';
import { Reservas } from './pages/reservas/reservas';
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
      { path: 'pagamentos', component: Pagamentos },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
