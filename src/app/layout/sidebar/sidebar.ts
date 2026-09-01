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
  /** Seção estratégica — recebe destaque visual (foco atual do negócio). */
  accent?: boolean;
  /** Seção secundária — pode ser recolhida para reduzir peso visual. */
  collapsible?: boolean;
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
      title: 'Financeiro',
      accent: true,
      items: [
        { label: 'Fluxo de Caixa', icon: 'trending-up', route: '/fluxo-caixa' },
        { label: 'Faturamento', icon: 'file-text', route: '/faturamento' },
        { label: 'Pagamentos e Contas', icon: 'credit-card', route: '/pagamentos' },
        { label: 'Fechamento de Caixa', icon: 'lock', route: '/fechamento-caixa' },
        { label: 'Relatórios', icon: 'bar-chart', route: '/relatorios' },
      ],
    },
    {
      title: 'Operações',
      collapsible: true,
      items: [
        { label: 'Reservas', icon: 'calendar', route: '/reservas' },
        { label: 'Check-in / Check-out', icon: 'key', route: '/checkin' },
        { label: 'Consumo de Serviços', icon: 'coffee', route: '/consumos' },
        { label: 'Hóspedes', icon: 'history', route: '/hospedes' },
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

  private readonly collapsedSections = signal(new Set(['Operações']));

  toggle(): void {
    this.collapsed.update((value) => !value);
  }

  toggleSection(title: string): void {
    this.collapsedSections.update((current) => {
      const next = new Set(current);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  isSectionCollapsed(title: string): boolean {
    return this.collapsedSections().has(title);
  }
}
