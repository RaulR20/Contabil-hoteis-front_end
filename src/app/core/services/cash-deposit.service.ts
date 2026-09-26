import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface CashDeposit {
  id: string;
  amount: number;
  origin: string;
  notes: string;
  occurredAt: Date;
  responsible: string;
}

export interface NewCashDeposit {
  amount: number;
  origin: string;
  notes: string;
  occurredAt: Date;
}

interface ApiCashDeposit {
  id: number;
  amount: number;
  origin: string;
  notes: string | null;
  occurredAt: string;
  responsible: string;
}

@Injectable({ providedIn: 'root' })
export class CashDepositService {
  private readonly api = inject(ApiService);
  private readonly depositsSignal = signal<CashDeposit[]>([]);
  readonly deposits = this.depositsSignal.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly todayDeposits = computed(() => {
    const today = new Date();
    return this.depositsSignal().filter((deposit) =>
      deposit.occurredAt.getFullYear() === today.getFullYear()
      && deposit.occurredAt.getMonth() === today.getMonth()
      && deposit.occurredAt.getDate() === today.getDate());
  });
  readonly todayAmount = computed(() =>
    this.todayDeposits().reduce((sum, deposit) => sum + deposit.amount, 0));

  constructor() { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<ApiCashDeposit[]>(this.api.hotelPath('cash-deposits')).subscribe({
      next: (rows) => {
        this.depositsSignal.set(rows.map((row) => this.fromApi(row)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as entradas de dinheiro.');
        this.loading.set(false);
      },
    });
  }

  add(deposit: NewCashDeposit): Observable<CashDeposit> {
    return this.api.post<ApiCashDeposit>(this.api.hotelPath('cash-deposits'), {
      ...deposit,
      occurredAt: deposit.occurredAt.toISOString(),
    }).pipe(
      map((row) => this.fromApi(row)),
      tap((created) => this.depositsSignal.update((rows) => [created, ...rows])),
    );
  }

  private fromApi(row: ApiCashDeposit): CashDeposit {
    return { ...row, id: String(row.id), amount: Number(row.amount),
      notes: row.notes ?? '', occurredAt: new Date(row.occurredAt) };
  }
}
