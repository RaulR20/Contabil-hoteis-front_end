import { Injectable, signal } from '@angular/core';

export type BillingCategory = 'Hospedagem' | 'Consumo de Serviços' | 'Outras Receitas';

export interface BillingRecord {
  id: string;
  date: Date;
  category: BillingCategory;
  description: string;
  value: number;
}

/** Fator de ocupação por dia da semana (dom..sáb) — fins de semana faturam mais. */
const WEEKDAY_FACTOR = [0.72, 0.82, 0.85, 0.88, 1.0, 1.35, 1.28];
const HISTORY_DAYS = 120;

function roundToFive(value: number): number {
  return Math.round(value / 5) * 5;
}

function seedRecords(): BillingRecord[] {
  const records: BillingRecord[] = [];
  const today = new Date();

  for (let daysAgo = 0; daysAgo < HISTORY_DAYS; daysAgo++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo, 20, 0, 0);
    const weekday = date.getDay();
    const seasonal = 1 + 0.18 * Math.sin((daysAgo / 30) * Math.PI * 2);
    const hospedagem = roundToFive(1650 * WEEKDAY_FACTOR[weekday] * seasonal);
    const consumo = roundToFive(hospedagem * 0.15);

    records.push({
      id: crypto.randomUUID(),
      date,
      category: 'Hospedagem',
      description: 'Faturamento de diárias e hospedagem',
      value: hospedagem,
    });
    records.push({
      id: crypto.randomUUID(),
      date,
      category: 'Consumo de Serviços',
      description: 'Frigobar, lavanderia e demais consumos',
      value: consumo,
    });

    if (daysAgo % 11 === 0) {
      records.push({
        id: crypto.randomUUID(),
        date,
        category: 'Outras Receitas',
        description: 'Estacionamento e serviços avulsos',
        value: 180,
      });
    }
  }

  return records;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly recordsSignal = signal<BillingRecord[]>(seedRecords());

  readonly records = this.recordsSignal.asReadonly();
}
