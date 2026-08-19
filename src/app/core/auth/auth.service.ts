import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, tap, throwError } from 'rxjs';

export interface AuthUser {
  username: string;
  name: string;
  role: string;
}

const MOCK_CREDENTIALS = { username: 'admin', password: 'admin123' };
const MOCK_USER: AuthUser = { username: 'admin', name: 'Raul Fernandes', role: 'Gestor Financeiro' };
const STORAGE_KEY = 'contabil-hoteis:auth-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly user = this.userSignal.asReadonly();

  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  login(username: string, password: string): Observable<AuthUser> {
    const isValid = username.trim().toLowerCase() === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password;

    if (!isValid) {
      return throwError(() => new Error('Usuário ou senha inválidos.')).pipe(delay(500));
    }

    return of(MOCK_USER).pipe(
      delay(600),
      tap((user) => {
        this.userSignal.set(user);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }),
    );
  }

  logout(): void {
    this.userSignal.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private readStoredUser(): AuthUser | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
