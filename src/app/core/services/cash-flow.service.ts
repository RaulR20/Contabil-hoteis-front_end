import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';

export type CashFlowType = 'receita' | 'despesa';
export type PaymentMethod = 'Dinheiro' | 'Pix' | 'Boleto' | 'TED' | 'DOC'
  | 'Cartão de Débito' | 'Cartão de Crédito';
export type PaymentMethodTone = 'primary' | 'success' | 'warning' | 'neutral';

export interface CashFlowEntry {
  id: string;
  description: string;
  category: string;
  type: CashFlowType;
  value: number;
  date: Date;
  paymentMethod: PaymentMethod;
}

export interface CashFlowEntryWithBalance extends CashFlowEntry {
  balance: number;
}

export interface NewCashFlowEntry {
  description: string;
  category: string;
  type: CashFlowType;
  value: number;
  date: Date;
  paymentMethod: PaymentMethod;
}

interface ApiCashEntry {
  id: number;
  description: string;
  category: string;
  kind: 'INCOME' | 'EXPENSE';
  amount: number;
  occurredAt: string;
  paymentMethod: 'CASH' | 'CARD' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
    | 'BOLETO' | 'TED' | 'DOC';
}

export const RECEITA_CATEGORIES = ['Hospedagem', 'Consumo de Serviços', 'Outras Receitas'];
export const DESPESA_CATEGORIES = ['Manutenção', 'Serviços Terceirizados', 'Compras', 'Salários', 'Outras Despesas'];
export const PAYMENT_METHODS: PaymentMethod[] = [
  'Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'TED', 'DOC',
];

export function paymentMethodIcon(method: PaymentMethod): string {
  switch (method) {
    case 'Dinheiro': return 'banknote';
    case 'Pix': return 'zap';
    case 'Boleto': return 'file-text';
    case 'TED':
    case 'DOC': return 'repeat';
    default: return 'credit-card';
  }
}

export function paymentMethodTone(method: PaymentMethod): PaymentMethodTone {
  switch (method) {
    case 'Pix': return 'success';
    case 'Dinheiro': return 'warning';
    case 'Cartão de Crédito':
    case 'Cartão de Débito': return 'primary';
    default: return 'neutral';
  }
}

@Injectable({ providedIn: 'root' })
export class CashFlowService {
  private readonly api = inject(ApiService);
  private readonly entriesSignal = signal<CashFlowEntry[]>([]);
  readonly entries = this.entriesSignal.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly todayEntries = computed(() => {
    const now = new Date();
    return this.entriesSignal().filter((entry) => this.isSameDay(entry.date, now));
  });
  readonly receitasDoDia = computed(() =>
    this.todayEntries().filter((entry) => entry.type === 'receita')
      .reduce((sum, entry) => sum + entry.value, 0));
  readonly despesasDoDia = computed(() =>
    this.todayEntries().filter((entry) => entry.type === 'despesa')
      .reduce((sum, entry) => sum + entry.value, 0));
  readonly saldoEmCaixa = computed(() =>
    this.entriesSignal().reduce((sum, entry) =>
      sum + (entry.type === 'receita' ? entry.value : -entry.value), 0));
  readonly faturamentoDoMes = computed(() => {
    const now = new Date();
    return this.entriesSignal()
      .filter((entry) => entry.type === 'receita'
        && entry.date.getMonth() === now.getMonth()
        && entry.date.getFullYear() === now.getFullYear())
      .reduce((sum, entry) => sum + entry.value, 0);
  });
  readonly dinheiroEmCaixaHoje = computed(() =>
    this.todayEntries().filter((entry) => entry.paymentMethod === 'Dinheiro')
      .reduce((sum, entry) => sum + (entry.type === 'receita' ? entry.value : -entry.value), 0));
  readonly entriesWithBalance = computed<CashFlowEntryWithBalance[]>(() => {
    const chronological = [...this.entriesSignal()].sort((a, b) => a.date.getTime() - b.date.getTime());
    let balance = 0;
    return chronological.map((entry) => {
      balance += entry.type === 'receita' ? entry.value : -entry.value;
      return { ...entry, balance };
    });
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<ApiCashEntry[]>(this.api.hotelPath('cash-entries')).subscribe({
      next: (rows) => {
        this.entriesSignal.set(rows.map((row) => this.fromApi(row)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os lançamentos do servidor.');
        this.loading.set(false);
      },
    });
  }

  addEntry(entry: NewCashFlowEntry): Observable<CashFlowEntry> {
    return this.api.post<ApiCashEntry>(this.api.hotelPath('cash-entries'), this.toApiBody(entry)).pipe(
      map((row) => this.fromApi(row)),
      tap((created) => this.entriesSignal.update((rows) => [created, ...rows])),
    );
  }

  updateEntry(id: string, entry: NewCashFlowEntry): Observable<CashFlowEntry> {
    return this.api.put<ApiCashEntry>(this.api.hotelPath(`cash-entries/${id}`), this.toApiBody(entry)).pipe(
      map((row) => this.fromApi(row)),
      tap((updated) => this.entriesSignal.update((rows) =>
        rows.map((row) => row.id === id ? updated : row))),
    );
  }

  deleteEntry(id: string): Observable<void> {
    return this.api.delete<void>(this.api.hotelPath(`cash-entries/${id}`)).pipe(
      tap(() => this.entriesSignal.update((rows) => rows.filter((row) => row.id !== id))),
    );
  }

  private toApiBody(entry: NewCashFlowEntry) {
    return {
      description: entry.description,
      category: entry.category,
      kind: entry.type === 'receita' ? 'INCOME' : 'EXPENSE',
      amount: entry.value,
      paymentMethod: this.toApiMethod(entry.paymentMethod),
      occurredAt: entry.date.toISOString(),
    };
  }

  private fromApi(row: ApiCashEntry): CashFlowEntry {
    return {
      id: String(row.id),
      description: row.description,
      category: row.category,
      type: row.kind === 'INCOME' ? 'receita' : 'despesa',
      value: Number(row.amount),
      date: new Date(row.occurredAt),
      paymentMethod: this.fromApiMethod(row.paymentMethod),
    };
  }

  private toApiMethod(method: PaymentMethod): ApiCashEntry['paymentMethod'] {
    const methods: Record<PaymentMethod, ApiCashEntry['paymentMethod']> = {
      Dinheiro: 'CASH', Pix: 'PIX', Boleto: 'BOLETO', TED: 'TED', DOC: 'DOC',
      'Cartão de Crédito': 'CREDIT_CARD', 'Cartão de Débito': 'DEBIT_CARD',
    };
    return methods[method];
  }

  private fromApiMethod(method: ApiCashEntry['paymentMethod']): PaymentMethod {
    const methods: Record<ApiCashEntry['paymentMethod'], PaymentMethod> = {
      CASH: 'Dinheiro', PIX: 'Pix', CARD: 'Cartão de Crédito',
      CREDIT_CARD: 'Cartão de Crédito', DEBIT_CARD: 'Cartão de Débito',
      BOLETO: 'Boleto', TED: 'TED', DOC: 'DOC',
    };
    return methods[method];
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
