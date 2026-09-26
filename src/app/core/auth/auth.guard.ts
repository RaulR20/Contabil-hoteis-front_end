import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { AuthService, AuthUser, UserRole, landingPage } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.refresh().pipe(map((user) => user ? true : router.createUrlTree(['/login'])));
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.refresh().pipe(map((user) => user ? router.createUrlTree([landingPage(user.role)]) : true));
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = route.data['roles'] as UserRole[] | undefined;
  const decide = (user: AuthUser | null) =>
    !user ? router.createUrlTree(['/login'])
      : (!allowed || allowed.includes(user.role)) ? true
      : router.createUrlTree([landingPage(user.role)]);
  const current = auth.user();
  return current ? of(decide(current)) : auth.refresh().pipe(map(decide));
};
