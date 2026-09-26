import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import { NewEntryDialog } from '../../shared/new-entry-dialog/new-entry-dialog';
import {
  CashFlowService,
  CashFlowEntry,
  CashFlowType,
  DESPESA_CATEGORIES,
  PAYMENT_METHODS,
  PaymentMethod,
  RECEITA_CATEGORIES,
  paymentMethodIcon,
  paymentMethodTone,
} from '../../core/services/cash-flow.service';
import { AuthService } from '../../core/auth/auth.service';

type TypeFilter = 'todos' | CashFlowType;
type PaymentFilter = 'todos' | PaymentMethod;

@Component({
  selector: 'app-fluxo-caixa',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon, NewEntryDialog],
  templateUrl: './fluxo-caixa.html',
  styleUrl: './fluxo-caixa.scss',
})
export class FluxoCaixa {
  protected readonly cashFlow = inject(CashFlowService);
  private readonly auth = inject(AuthService);
  protected readonly canDelete = computed(() => this.auth.user()?.role !== 'CASHIER');
  protected readonly actionError = signal<string | null>(null);
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly paymentMethodIcon = paymentMethodIcon;
  protected readonly paymentMethodTone = paymentMethodTone;

  protected readonly dialogOpen = signal(false);
  protected readonly dialogType = signal<CashFlowType>('receita');
  protected readonly editingEntry = signal<CashFlowEntry | null>(null);

  protected readonly searchTerm = signal('');
  protected readonly typeFilter = signal<TypeFilter>('todos');
  protected readonly paymentFilter = signal<PaymentFilter>('todos');
  protected readonly categoryFilter = signal('todas');
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');

  protected readonly categories = computed(() => {
    const all = [...RECEITA_CATEGORIES, ...DESPESA_CATEGORIES];
    return Array.from(new Set(all));
  });

  private readonly chronologicalDesc = computed(() => [...this.cashFlow.entriesWithBalance()].reverse());

  protected readonly filteredEntries = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    const payment = this.paymentFilter();
    const category = this.categoryFilter();
    const from = this.dateFrom() ? new Date(this.dateFrom() + 'T00:00:00') : null;
    const to = this.dateTo() ? new Date(this.dateTo() + 'T23:59:59') : null;

    return this.chronologicalDesc().filter((entry) => {
      if (term && !entry.description.toLowerCase().includes(term)) return false;
      if (type !== 'todos' && entry.type !== type) return false;
      if (payment !== 'todos' && entry.paymentMethod !== payment) return false;
      if (category !== 'todas' && entry.category !== category) return false;
      if (from && entry.date < from) return false;
      if (to && entry.date > to) return false;
      return true;
    });
  });

  protected readonly summary = computed(() => {
    const entries = this.filteredEntries();
    const receitas = entries.filter((e) => e.type === 'receita').reduce((sum, e) => sum + e.value, 0);
    const despesas = entries.filter((e) => e.type === 'despesa').reduce((sum, e) => sum + e.value, 0);
    return { receitas, despesas, quantidade: entries.length };
  });

  hasActiveFilters(): boolean {
    return (
      this.searchTerm().trim() !== '' ||
      this.typeFilter() !== 'todos' ||
      this.paymentFilter() !== 'todos' ||
      this.categoryFilter() !== 'todas' ||
      this.dateFrom() !== '' ||
      this.dateTo() !== ''
    );
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.typeFilter.set('todos');
    this.paymentFilter.set('todos');
    this.categoryFilter.set('todas');
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  openDialog(type: CashFlowType = 'receita'): void {
    this.editingEntry.set(null);
    this.dialogType.set(type);
    this.dialogOpen.set(true);
  }

  editEntry(entry: CashFlowEntry): void {
    this.actionError.set(null);
    this.editingEntry.set(entry);
    this.dialogOpen.set(true);
  }

  deleteEntry(entry: CashFlowEntry): void {
    if (!this.canDelete() || !window.confirm(`Excluir o lançamento "${entry.description}"?`)) return;
    this.actionError.set(null);
    this.cashFlow.deleteEntry(entry.id).subscribe({
      error: () => this.actionError.set('Não foi possível excluir. Confira se o caixa dessa data já foi fechado.'),
    });
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingEntry.set(null);
  }
}
