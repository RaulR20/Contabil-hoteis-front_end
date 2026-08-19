import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected username = 'admin';
  protected password = '';
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  submit(): void {
    if (this.loading()) {
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  fillDemoCredentials(): void {
    this.username = 'admin';
    this.password = 'admin123';
  }
}
