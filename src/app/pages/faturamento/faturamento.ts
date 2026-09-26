import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import { NewTaxDialog } from '../../shared/new-tax-dialog/new-tax-dialog';
import { BillingCategory, BillingService } from '../../core/services/billing.service';
import { TAX_REGIMES, Tax, TaxBase, TaxService } from '../../core/services/tax.service';

interface CategorySlice {
  label: BillingCategory;
  value: number;
  percentage: number;
}

interface TaxRow extends Tax {
  baseValue: number;
  amount: number;
}

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, Icon, NewTaxDialog],
  providers: [DatePipe],
  templateUrl: './faturamento.html',
  styleUrl: './faturamento.scss',
})
export class Faturamento {
  protected readonly billing = inject(BillingService);
  private readonly datePipe = inject(DatePipe);

  protected readonly taxService = inject(TaxService);
  protected readonly regimes = TAX_REGIMES;
  protected readonly taxDialogOpen = signal(false);

  protected readonly monthLabel = computed(() => this.datePipe.transform(new Date(), 'MMMM/yyyy') ?? '');

  private readonly today = new Date();

  private readonly monthRecords = computed(() => {
    const now = new Date();
    return this.billing
      .records()
      .filter((record) => record.date.getFullYear() === now.getFullYear() && record.date.getMonth() === now.getMonth());
  });

  /** Dias já decorridos no mês corrente (nossos dados só cobrem até hoje). */
  private readonly elapsedDays = computed(() => this.today.getDate());

  protected readonly monthlyTotal = computed(() =>
    this.monthRecords().reduce((sum, record) => sum + record.value, 0),
  );

  protected readonly dailyAverage = computed(() => this.monthlyTotal() / Math.max(1, this.elapsedDays()));

  protected readonly weeklyAverage = computed(() => this.dailyAverage() * 7);

  protected readonly categoryBreakdown = computed<CategorySlice[]>(() => {
    const totals = new Map<BillingCategory, number>();

    for (const record of this.monthRecords()) {
      totals.set(record.category, (totals.get(record.category) ?? 0) + record.value);
    }

    const total = this.monthlyTotal() || 1;

    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value, percentage: Math.round((value / total) * 100) }))
      .sort((a, b) => b.value - a.value);
  });

  /** Valor do mês que serve de base para cada tipo de alíquota. */
  private baseValue(base: TaxBase): number {
    if (base === 'Receita Bruta') {
      return this.monthlyTotal();
    }

    return this.monthRecords()
      .filter((record) => record.category === base)
      .reduce((sum, record) => sum + record.value, 0);
  }

  protected readonly taxRows = computed<TaxRow[]>(() =>
    this.taxService.taxes().map((tax) => {
      const baseValue = this.baseValue(tax.base);
      return {
        ...tax,
        baseValue,
        amount: tax.active ? (baseValue * tax.rate) / 100 : 0,
      };
    }),
  );

  protected readonly totalTaxes = computed(() =>
    this.taxRows().reduce((sum, row) => sum + row.amount, 0),
  );

  protected readonly effectiveRate = computed(() => {
    const revenue = this.monthlyTotal();
    return revenue > 0 ? (this.totalTaxes() / revenue) * 100 : 0;
  });

  protected readonly netRevenue = computed(() => this.monthlyTotal() - this.totalTaxes());

  updateRate(id: string, value: string): void {
    const rate = Number(value);

    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      return;
    }

    this.taxService.updateRate(id, rate);
  }

  openTaxDialog(): void {
    this.taxDialogOpen.set(true);
  }

  closeTaxDialog(): void {
    this.taxDialogOpen.set(false);
  }

  protected categoryIcon(category: BillingCategory): string {
    switch (category) {
      case 'Hospedagem':
        return 'building';
      case 'Consumo de Serviços':
        return 'coffee';
      default:
        return 'dollar-sign';
    }
  }
}
