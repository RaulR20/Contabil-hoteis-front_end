import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: Home },
    ],
  },
];
