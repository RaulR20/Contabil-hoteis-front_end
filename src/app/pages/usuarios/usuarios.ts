import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface Account {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  active: boolean;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  protected readonly users = signal<Account[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly resetPasswords = signal<Record<number, string>>({});

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
    role: ['MANAGER' as 'MANAGER' | 'CASHIER', Validators.required],
  });

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.http.get<Account[]>('/api/admin/users').subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set('Não foi possível carregar os usuários.'),
    });
  }

  create(): void {
    this.error.set(null);
    this.success.set(null);
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.http.post<Account>('/api/admin/users', this.form.getRawValue()).subscribe({
      next: (user) => {
        this.users.update((rows) => [...rows, user]);
        this.form.reset({ name: '', email: '', password: '', role: 'MANAGER' });
        this.success.set(`Conta de ${user.name} criada. A senha informada já pode ser usada no login.`);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 409 ? 'Este e-mail já está cadastrado.' : 'Não foi possível criar o usuário.');
        this.saving.set(false);
      },
    });
  }

  setResetPassword(id: number, value: string): void {
    this.resetPasswords.update((current) => ({ ...current, [id]: value }));
  }

  resetPassword(user: Account): void {
    const password = this.resetPasswords()[user.id] ?? '';
    this.error.set(null);
    this.success.set(null);
    if (password.length < 12) {
      this.error.set('A nova senha precisa ter pelo menos 12 caracteres.');
      return;
    }
    this.http.put<void>(`/api/admin/users/${user.id}/password`, { password }).subscribe({
      next: () => {
        this.setResetPassword(user.id, '');
        this.success.set(`Senha de ${user.name} atualizada.`);
      },
      error: () => this.error.set('Não foi possível atualizar a senha.'),
    });
  }

  roleName(role: Account['role']): string {
    return { ADMIN: 'Administrador', MANAGER: 'Gerente', CASHIER: 'Caixa' }[role];
  }
}
