import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface CashClosing {
  id: string;
  businessDate: string;
  date: Date;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  responsible: string;
  notes: string;
}

export interface NewCashClosing {
  countedAmount: number;
  notes: string;
}

interface ApiClosing {
  id: number;
  businessDate: string;
  date: string;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  responsible: string;
  notes: string | null;
}

@Injectable({ providedIn: 'root' })
export class CashClosingService {
  private readonly api = inject(ApiService);
  private readonly closingsSignal = signal<CashClosing[]>([]);
  readonly closings = computed(() =>
    [...this.closingsSignal()].sort((a, b) => b.date.getTime() - a.date.getTime()));
  readonly todayClosing = computed(() =>
    this.closingsSignal().find((closing) => closing.businessDate === this.todayIsoDate()));
  readonly error = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.api.get<ApiClosing[]>(this.api.hotelPath('cash-closings')).subscribe({
      next: (rows) => this.closingsSignal.set(rows.map((row) => this.fromApi(row))),
      error: () => this.error.set('Não foi possível carregar os fechamentos do servidor.'),
    });
  }

  close(entry: NewCashClosing): Observable<CashClosing> {
    return this.api.post<ApiClosing>(this.api.hotelPath('cash-closings'), entry).pipe(
      map((row) => this.fromApi(row)),
      tap((created) => this.closingsSignal.update((rows) => [created, ...rows])),
    );
  }

  private fromApi(row: ApiClosing): CashClosing {
    return {
      id: String(row.id),
      businessDate: row.businessDate,
      date: new Date(row.date),
      expectedAmount: Number(row.expectedAmount),
      countedAmount: Number(row.countedAmount),
      difference: Number(row.difference),
      responsible: row.responsible ?? '',
      notes: row.notes ?? '',
    };
  }

  private todayIsoDate(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
}
