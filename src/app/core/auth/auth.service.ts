import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface AuthUser {
  id: number;
  hotelId: number;
  email: string;
  name: string;
  role: UserRole;
}

export function landingPage(role: UserRole): string {
  return role === 'ADMIN' ? '/home' : '/fluxo-caixa';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userSignal = signal<AuthUser | null>(null);
  readonly user = this.userSignal.asReadonly();

  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  refresh(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>('/api/auth/me').pipe(
      tap((user) => this.userSignal.set(user)),
      catchError(() => {
        this.userSignal.set(null);
        return of(null);
      }),
    );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.get<void>('/api/auth/csrf').pipe(
      switchMap(() => this.http.post<AuthUser>('/api/auth/login', { email: email.trim(), password })),
      switchMap((user) => this.http.get<void>('/api/auth/csrf').pipe(map(() => user))),
      tap((user) => this.userSignal.set(user)),
      catchError((error: HttpErrorResponse) =>
        throwError(
          () =>
            new Error(
              error.status === 401
                ? 'E-mail ou senha inválidos.'
                : 'Não foi possível entrar. Confira se o backend está funcionando.',
            ),
        ),
      ),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => this.userSignal.set(null)),
    );
  }
}
