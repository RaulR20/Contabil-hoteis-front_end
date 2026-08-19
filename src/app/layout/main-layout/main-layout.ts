import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Icon } from '../../shared/icon/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Icon],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
