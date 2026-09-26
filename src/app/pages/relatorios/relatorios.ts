import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import {
  CashFlowService,
  PAYMENT_METHODS,
  PaymentMethod,
  paymentMethodIcon,
  paymentMethodTone,
} from '../../core/services/cash-flow.service';
import { CashClosingService } from '../../core/services/cash-closing.service';
import { ReservationService, estimatedValue, nightsBetween } from '../../core/services/reservation.service';
import { AuthService } from '../../core/auth/auth.service';

type PeriodPreset = 'hoje' | 'sete-dias' | 'mes-atual' | 'mes-anterior' | 'personalizado';
type SectionId = 'caixa' | 'receitas' | 'despesas' | 'pagamentos' | 'receber' | 'fechamentos' | 'extrato';

interface ReportSection {
  id: SectionId;
  label: string;
  description: string;
  icon: string;
}

interface CategoryTotal {
  category: string;
  value: number;
  percentage: number;
}

interface PaymentTotal {
  method: PaymentMethod;
  value: number;
  count: number;
}

interface ReceivableRow {
  id: string;
  guestName: string;
  room: string;
  checkOut: Date;
  nights: number;
  value: number;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class Relatorios {
  private readonly auth = inject(AuthService);
  protected readonly reservationService = inject(ReservationService);

  protected readonly cashFlow = inject(CashFlowService);
  protected readonly closingService = inject(CashClosingService);
  protected readonly paymentMethodIcon = paymentMethodIcon;
  protected readonly paymentMethodTone = paymentMethodTone;

  protected readonly generatedAt = new Date();
  protected readonly responsible = this.auth.user()?.name ?? 'Usuário';

  protected readonly sections: ReportSection[] = [
    {
      id: 'caixa',
      label: 'Saldo e Movimentação dos Lançamentos',
      description: 'Saldo dos lançamentos manuais, entradas, saídas e resultado do período',
      icon: 'dollar-sign',
    },
    {
      id: 'receitas',
      label: 'Receitas por Categoria',
      description: 'Hospedagem, consumo de serviços e outras receitas',
      icon: 'trending-up',
    },
    {
      id: 'despesas',
      label: 'Despesas e Custos por Categoria',
      description: 'Compras, manutenção, salários e serviços terceirizados',
      icon: 'arrow-down-right',
    },
    {
      id: 'pagamentos',
      label: 'Formas de Pagamento',
      description: 'Total recebido por Pix, cartão, dinheiro, boleto, TED e DOC',
      icon: 'credit-card',
    },
    {
      id: 'receber',
      label: 'Valor Previsto das Reservas',
      description: 'Estimativa das reservas confirmadas, sem conciliação de pagamentos',
      icon: 'calendar',
    },
    {
      id: 'fechamentos',
      label: 'Fechamentos de Caixa',
      description: 'Conferências do período com sobras e faltas apuradas',
      icon: 'lock',
    },
    {
      id: 'extrato',
      label: 'Extrato Detalhado',
      description: 'Lista completa dos lançamentos do período',
      icon: 'file-text',
    },
  ];

  protected readonly periodPresets: { value: PeriodPreset; label: string }[] = [
    { value: 'hoje', label: 'Hoje' },
    { value: 'sete-dias', label: 'Últimos 7 dias' },
    { value: 'mes-atual', label: 'Mês atual' },
    { value: 'mes-anterior', label: 'Mês anterior' },
    { value: 'personalizado', label: 'Personalizado' },
  ];

  protected readonly preset = signal<PeriodPreset>('mes-atual');
  protected readonly customFrom = signal('');
  protected readonly customTo = signal('');

  private readonly selected = signal<Set<SectionId>>(
    new Set<SectionId>(['caixa', 'receitas', 'despesas', 'pagamentos']),
  );

  protected readonly selectedCount = computed(() => this.selected().size);

  protected readonly range = computed<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (this.preset()) {
      case 'hoje':
        return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: endOfToday };
      case 'sete-dias':
        return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6), to: endOfToday };
      case 'mes-anterior': {
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return { from, to };
      }
      case 'personalizado': {
        const from = this.customFrom()
          ? new Date(this.customFrom() + 'T00:00:00')
          : new Date(now.getFullYear(), now.getMonth(), 1);
        const to = this.customTo() ? new Date(this.customTo() + 'T23:59:59') : endOfToday;
        return { from, to };
      }
      default:
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfToday };
    }
  });

  private readonly entriesInPeriod = computed(() => {
    const { from, to } = this.range();
    return this.cashFlow.entries().filter((entry) => entry.date >= from && entry.date <= to);
  });

  protected readonly resumoCaixa = computed(() => {
    const entries = this.entriesInPeriod();
    const entradas = entries.filter((e) => e.type === 'receita').reduce((sum, e) => sum + e.value, 0);
    const saidas = entries.filter((e) => e.type === 'despesa').reduce((sum, e) => sum + e.value, 0);

    return {
      saldoAtual: this.cashFlow.saldoEmCaixa(),
      entradas,
      saidas,
      resultado: entradas - saidas,
      quantidade: entries.length,
    };
  });

  protected readonly receitasPorCategoria = computed(() => this.groupByCategory('receita'));
  protected readonly despesasPorCategoria = computed(() => this.groupByCategory('despesa'));

  protected readonly porFormaPagamento = computed<PaymentTotal[]>(() =>
    PAYMENT_METHODS.map((method) => {
      const entries = this.entriesInPeriod().filter((entry) => entry.paymentMethod === method);
      const value = entries.reduce((sum, e) => sum + (e.type === 'receita' ? e.value : -e.value), 0);
      return { method, value, count: entries.length };
    }).filter((row) => row.count > 0),
  );

  protected readonly contasAReceber = computed<ReceivableRow[]>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.reservationService
      .reservations()
      .filter((reservation) =>
        (reservation.status === 'Confirmada' || reservation.status === 'Em hospedagem')
        && reservation.checkOut >= now)
      .map((reservation) => ({
        id: reservation.id,
        guestName: reservation.guestName,
        room: reservation.room,
        checkOut: reservation.checkOut,
        nights: nightsBetween(reservation.checkIn, reservation.checkOut),
        value: estimatedValue(reservation),
      }));
  });

  protected readonly totalAReceber = computed(() =>
    this.contasAReceber().reduce((sum, row) => sum + row.value, 0),
  );

  protected readonly fechamentosNoPeriodo = computed(() => {
    const { from, to } = this.range();
    return this.closingService.closings().filter((closing) => closing.date >= from && closing.date <= to);
  });

  protected readonly extrato = computed(() =>
    [...this.entriesInPeriod()].sort((a, b) => b.date.getTime() - a.date.getTime()),
  );

  isSelected(id: SectionId): boolean {
    return this.selected().has(id);
  }

  toggleSection(id: SectionId): void {
    this.selected.update((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  selectAll(): void {
    this.selected.set(new Set(this.sections.map((section) => section.id)));
  }

  clearAll(): void {
    this.selected.set(new Set());
  }

  print(): void {
    window.print();
  }

  private groupByCategory(type: 'receita' | 'despesa'): CategoryTotal[] {
    const totals = new Map<string, number>();

    for (const entry of this.entriesInPeriod()) {
      if (entry.type !== type) continue;
      totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.value);
    }

    const total = Array.from(totals.values()).reduce((sum, value) => sum + value, 0) || 1;

    return Array.from(totals.entries())
      .map(([category, value]) => ({
        category,
        value,
        percentage: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }
}
