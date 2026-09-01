import { Injectable, computed, signal } from '@angular/core';

export type CashFlowType = 'receita' | 'despesa';
export type PaymentMethod = 'Dinheiro' | 'Cartão' | 'Pix';

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

export const RECEITA_CATEGORIES = ['Hospedagem', 'Consumo de Serviços', 'Outras Receitas'];
export const DESPESA_CATEGORIES = ['Manutenção', 'Serviços Terceirizados', 'Compras', 'Salários', 'Outras Despesas'];

export const PAYMENT_METHODS: PaymentMethod[] = ['Dinheiro', 'Cartão', 'Pix'];

export function paymentMethodIcon(method: PaymentMethod): string {
  switch (method) {
    case 'Dinheiro':
      return 'banknote';
    case 'Pix':
      return 'zap';
    default:
      return 'credit-card';
  }
}

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
      paymentMethod: 'Pix',
    },
    {
      id: crypto.randomUUID(),
      description: 'Pagamento lavanderia terceirizada',
      category: 'Serviços Terceirizados',
      type: 'despesa',
      value: 610.0,
      date: at(13, 15),
      paymentMethod: 'Pix',
    },
    {
      id: crypto.randomUUID(),
      description: 'Compra de material de limpeza',
      category: 'Manutenção',
      type: 'despesa',
      value: 320.9,
      date: at(11, 40),
      paymentMethod: 'Dinheiro',
    },
    {
      id: crypto.randomUUID(),
      description: 'Consumo Frigobar - Quarto 204',
      category: 'Consumo de Serviços',
      type: 'receita',
      value: 45.0,
      date: at(10, 5),
      paymentMethod: 'Dinheiro',
    },
    {
      id: crypto.randomUUID(),
      description: 'Faturamento reserva #101 - João Silva',
      category: 'Hospedagem',
      type: 'receita',
      value: 875.0,
      date: at(9, 20),
      paymentMethod: 'Cartão',
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

  /** Saldo em espécie apurável fisicamente — base do futuro fechamento de caixa. */
  readonly dinheiroEmCaixaHoje = computed(() =>
    this.todayEntries()
      .filter((entry) => entry.paymentMethod === 'Dinheiro')
      .reduce((sum, entry) => sum + (entry.type === 'receita' ? entry.value : -entry.value), 0),
  );

  /** Extrato cronológico (mais antigo primeiro) com saldo acumulado após cada lançamento. */
  readonly entriesWithBalance = computed<CashFlowEntryWithBalance[]>(() => {
    const chronological = [...this.entriesSignal()].sort((a, b) => a.date.getTime() - b.date.getTime());
    let running = OPENING_BALANCE;

    return chronological.map((entry) => {
      running += entry.type === 'receita' ? entry.value : -entry.value;
      return { ...entry, balance: running };
    });
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
