import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly auth = inject(AuthService);

  protected readonly collapsed = signal(false);
  protected readonly user = this.auth.user;

  protected readonly sections: NavSection[] = [
    {
      title: 'Visão Geral',
      items: [{ label: 'Dashboard', icon: 'grid', route: '/home' }],
    },
    {
      title: 'Operações',
      items: [
        { label: 'Reservas', icon: 'calendar', route: '/reservas' },
        { label: 'Check-in / Check-out', icon: 'key', route: '/checkin' },
        { label: 'Consumo de Serviços', icon: 'coffee', route: '/consumos' },
        { label: 'Hóspedes', icon: 'user', route: '/hospedes' },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { label: 'Fluxo de Caixa', icon: 'trending-up', route: '/fluxo-caixa' },
        { label: 'Faturamento', icon: 'file-text', route: '/faturamento' },
        { label: 'Pagamentos e Contas', icon: 'credit-card', route: '/pagamentos' },
        { label: 'Fechamento de Caixa', icon: 'lock', route: '/fechamento-caixa' },
        { label: 'Relatórios', icon: 'bar-chart', route: '/relatorios' },
      ],
    },
    {
      title: 'Administração',
      items: [
        { label: 'Usuários e Permissões', icon: 'users', route: '/usuarios' },
        { label: 'Taxas e Impostos', icon: 'percent', route: '/taxas' },
      ],
    },
  ];

  toggle(): void {
    this.collapsed.update((value) => !value);
  }
}
