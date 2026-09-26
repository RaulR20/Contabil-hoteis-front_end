import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { AuthService, UserRole, landingPage } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
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
  protected readonly startRoute = computed(() => landingPage(this.user()?.role ?? 'ADMIN'));
  protected readonly roleLabel = computed(() => ({ ADMIN: 'Administrador', MANAGER: 'Gerente', CASHIER: 'Caixa' })[this.user()?.role ?? 'ADMIN']);

  protected readonly sections: NavSection[] = [
    {
      title: 'Visão Geral',
      items: [{ label: 'Dashboard', icon: 'grid', route: '/home', roles: ['ADMIN'] }],
    },
    {
      title: 'Financeiro',
      accent: true,
      items: [
        { label: 'Fluxo de Caixa', icon: 'trending-up', route: '/fluxo-caixa', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
        { label: 'Faturamento e Impostos', icon: 'file-text', route: '/faturamento', roles: ['ADMIN'] },
        { label: 'Pagamentos e Contas', icon: 'credit-card', route: '/pagamentos', roles: ['ADMIN', 'MANAGER'] },
        { label: 'Fechamento de Caixa', icon: 'lock', route: '/fechamento-caixa', roles: ['ADMIN', 'MANAGER'] },
        { label: 'Relatórios', icon: 'bar-chart', route: '/relatorios', roles: ['ADMIN'] },
      ],
    },
    {
      title: 'Operações',
      collapsible: true,
      items: [
        { label: 'Reservas', icon: 'calendar', route: '/reservas', roles: ['ADMIN'] },
        { label: 'Check-in / Check-out', icon: 'key', route: '/checkin', roles: ['ADMIN'] },
        { label: 'Hóspedes', icon: 'history', route: '/hospedes', roles: ['ADMIN'] },
      ],
    },
    { title: 'Administração', items: [{ label: 'Usuários', icon: 'user', route: '/usuarios', roles: ['ADMIN'] }] },
  ];

  protected readonly visibleSections = computed(() => {
    const role = this.user()?.role;
    return this.sections.map((section) => ({
      ...section,
      items: section.items.filter((item) => role && item.roles.includes(role)),
    })).filter((section) => section.items.length > 0);
  });

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
