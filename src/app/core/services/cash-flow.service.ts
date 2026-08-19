import { Injectable, computed, signal } from '@angular/core';

export type CashFlowType = 'receita' | 'despesa';

export interface CashFlowEntry {
  id: string;
  description: string;
  category: string;
  type: CashFlowType;
  value: number;
  date: Date;
}

export interface NewCashFlowEntry {
  description: string;
  category: string;
  type: CashFlowType;
  value: number;
  date: Date;
}

export const RECEITA_CATEGORIES = ['Hospedagem', 'Consumo de Serviços', 'Outras Receitas'];
export const DESPESA_CATEGORIES = ['Manutenção', 'Serviços Terceirizados', 'Compras', 'Salários', 'Outras Despesas'];

const OPENING_BALANCE = 37765.32;

function seedEntries(): CashFlowEntry[] {
  const today = new Date();
  const at = (hours: number, minutes: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

  return [
    {
      id: crypto.randomUUID(),
      description: 'Faturamento reserva #108 - Ana Costa',
      category: 'Hospedagem',
      type: 'receita',
      value: 1240.0,
      date: at(14, 50),
    },
    {
      id: crypto.randomUUID(),
      description: 'Pagamento lavanderia terceirizada',
      category: 'Serviços Terceirizados',
      type: 'despesa',
      value: 610.0,
      date: at(13, 15),
    },
    {
      id: crypto.randomUUID(),
      description: 'Compra de material de limpeza',
      category: 'Manutenção',
      type: 'despesa',
      value: 320.9,
      date: at(11, 40),
    },
    {
      id: crypto.randomUUID(),
      description: 'Consumo Frigobar - Quarto 204',
      category: 'Consumo de Serviços',
      type: 'receita',
      value: 45.0,
      date: at(10, 5),
    },
    {
      id: crypto.randomUUID(),
      description: 'Faturamento reserva #101 - João Silva',
      category: 'Hospedagem',
      type: 'receita',
      value: 875.0,
      date: at(9, 20),
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class CashFlowService {
  private readonly entriesSignal = signal<CashFlowEntry[]>(seedEntries());

  readonly entries = this.entriesSignal.asReadonly();

  readonly todayEntries = computed(() => {
    const now = new Date();
    return this.entriesSignal().filter((entry) => this.isSameDay(entry.date, now));
  });

  readonly receitasDoDia = computed(() =>
    this.todayEntries()
      .filter((entry) => entry.type === 'receita')
      .reduce((sum, entry) => sum + entry.value, 0),
  );

  readonly despesasDoDia = computed(() =>
    this.todayEntries()
      .filter((entry) => entry.type === 'despesa')
      .reduce((sum, entry) => sum + entry.value, 0),
  );

  readonly saldoEmCaixa = computed(() =>
    this.entriesSignal().reduce(
      (sum, entry) => sum + (entry.type === 'receita' ? entry.value : -entry.value),
      OPENING_BALANCE,
    ),
  );

  readonly faturamentoDoMes = computed(() => {
    const now = new Date();
    return this.entriesSignal()
      .filter(
        (entry) =>
          entry.type === 'receita' &&
          entry.date.getMonth() === now.getMonth() &&
          entry.date.getFullYear() === now.getFullYear(),
      )
      .reduce((sum, entry) => sum + entry.value, 174950.9);
  });

  addEntry(entry: NewCashFlowEntry): void {
    const newEntry: CashFlowEntry = { id: crypto.randomUUID(), ...entry };
    this.entriesSignal.update((entries) =>
      [...entries, newEntry].sort((a, b) => b.date.getTime() - a.date.getTime()),
    );
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
