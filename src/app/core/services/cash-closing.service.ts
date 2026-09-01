import { Injectable, computed, signal } from '@angular/core';

export interface CashClosing {
  id: string;
  date: Date;
  expectedAmount: number;
  countedAmount: number;
  difference: number;
  responsible: string;
  notes: string;
}

export interface NewCashClosing {
  expectedAmount: number;
  countedAmount: number;
  responsible: string;
  notes: string;
}

function daysAgo(days: number, hours: number, minutes: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function seedClosings(): CashClosing[] {
  return [
    {
      id: crypto.randomUUID(),
      date: daysAgo(1, 22, 5),
      expectedAmount: 612.4,
      countedAmount: 612.4,
      difference: 0,
      responsible: 'Raul Fernandes',
      notes: '',
    },
    {
      id: crypto.randomUUID(),
      date: daysAgo(2, 21, 50),
      expectedAmount: 388.0,
      countedAmount: 373.0,
      difference: -15.0,
      responsible: 'Raul Fernandes',
      notes: 'Falta de troco identificada, aguardando conferência com o turno da tarde.',
    },
    {
      id: crypto.randomUUID(),
      date: daysAgo(3, 22, 15),
      expectedAmount: 745.9,
      countedAmount: 750.0,
      difference: 4.1,
      responsible: 'Raul Fernandes',
      notes: '',
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class CashClosingService {
  private readonly closingsSignal = signal<CashClosing[]>(seedClosings());

  readonly closings = computed(() =>
    [...this.closingsSignal()].sort((a, b) => b.date.getTime() - a.date.getTime()),
  );

  readonly todayClosing = computed(() =>
    this.closingsSignal().find((closing) => this.isSameDay(closing.date, new Date())),
  );

  close(entry: NewCashClosing): void {
    const newClosing: CashClosing = {
      id: crypto.randomUUID(),
      date: new Date(),
      difference: entry.countedAmount - entry.expectedAmount,
      ...entry,
    };
    this.closingsSignal.update((closings) => [...closings, newClosing]);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
