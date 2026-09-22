import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import {
  CashFlowService,
  CashFlowType,
  PAYMENT_METHODS,
  PaymentMethod,
  paymentMethodIcon,
  paymentMethodTone,
} from '../../core/services/cash-flow.service';

type TypeFilter = 'todos' | CashFlowType;
type MethodFilter = 'todas' | PaymentMethod;

interface MethodSummary {
  method: PaymentMethod;
  total: number;
  count: number;
}

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon],
  templateUrl: './pagamentos.html',
  styleUrl: './pagamentos.scss',
})
export class Pagamentos {
  protected readonly cashFlow = inject(CashFlowService);
  protected readonly paymentMethodIcon = paymentMethodIcon;
  protected readonly paymentMethodTone = paymentMethodTone;

  protected readonly selectedMethod = signal<MethodFilter>('todas');
  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<TypeFilter>('todos');
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');

  protected readonly methodSummaries = computed<MethodSummary[]>(() =>
    PAYMENT_METHODS.map((method) => {
      const entries = this.cashFlow.entries().filter((entry) => entry.paymentMethod === method);
      const total = entries.reduce((sum, entry) => sum + (entry.type === 'receita' ? entry.value : -entry.value), 0);
      return { method, total, count: entries.length };
    }),
  );

  private readonly chronologicalDesc = computed(() => [...this.cashFlow.entriesWithBalance()].reverse());

  protected readonly filteredEntries = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const method = this.selectedMethod();
    const type = this.typeFilter();
    const from = this.dateFrom() ? new Date(this.dateFrom() + 'T00:00:00') : null;
    const to = this.dateTo() ? new Date(this.dateTo() + 'T23:59:59') : null;

    return this.chronologicalDesc().filter((entry) => {
      if (term && !entry.description.toLowerCase().includes(term)) return false;
      if (method !== 'todas' && entry.paymentMethod !== method) return false;
      if (type !== 'todos' && entry.type !== type) return false;
      if (from && entry.date < from) return false;
      if (to && entry.date > to) return false;
      return true;
    });
  });

  selectMethod(method: MethodFilter): void {
    this.selectedMethod.set(this.selectedMethod() === method ? 'todas' : method);
  }

  hasActiveFilters(): boolean {
    return (
      this.searchTerm().trim() !== '' ||
      this.selectedMethod() !== 'todas' ||
      this.typeFilter() !== 'todos' ||
      this.dateFrom() !== '' ||
      this.dateTo() !== ''
    );
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedMethod.set('todas');
    this.typeFilter.set('todos');
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  protected isBankSettled(method: PaymentMethod): boolean {
    return method !== 'Dinheiro';
  }
}
