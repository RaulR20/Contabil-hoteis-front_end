import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import { BillingCategory, BillingService } from '../../core/services/billing.service';

interface CategorySlice {
  label: BillingCategory;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [CurrencyPipe, Icon],
  providers: [DatePipe],
  templateUrl: './faturamento.html',
  styleUrl: './faturamento.scss',
})
export class Faturamento {
  private readonly billing = inject(BillingService);
  private readonly datePipe = inject(DatePipe);

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
