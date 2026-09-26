import { Injectable, computed, inject } from '@angular/core';
import { CashFlowService } from './cash-flow.service';

export type BillingCategory = 'Hospedagem' | 'Consumo de Serviços' | 'Outras Receitas';

export interface BillingRecord {
  id: string;
  date: Date;
  category: BillingCategory;
  description: string;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly cashFlow = inject(CashFlowService);
  readonly error = this.cashFlow.error;
  readonly records = computed<BillingRecord[]>(() =>
    this.cashFlow.entries()
      .filter((entry) => entry.type === 'receita')
      .map((entry) => ({
        id: entry.id,
        date: entry.date,
        category: this.category(entry.category),
        description: entry.description,
        value: entry.value,
      })),
  );

  private category(value: string): BillingCategory {
    return value === 'Hospedagem' || value === 'Consumo de Serviços'
      ? value : 'Outras Receitas';
  }
}
