import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import {
  CashFlowService,
  CashFlowType,
  paymentMethodIcon,
  paymentMethodTone,
} from '../../core/services/cash-flow.service';
import { NewEntryDialog } from '../../shared/new-entry-dialog/new-entry-dialog';

interface Kpi {
  label: string;
  value: number;
  variation: number;
  icon: string;
  tone: 'primary' | 'success' | 'danger' | 'warning';
}

interface CategoryBreakdown {
  category: string;
  value: number;
  percentage: number;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  type?: CashFlowType;
  route?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon, NewEntryDialog, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly router = inject(Router);

  protected readonly cashFlow = inject(CashFlowService);
  protected readonly paymentMethodIcon = paymentMethodIcon;
  protected readonly paymentMethodTone = paymentMethodTone;

  protected readonly today = new Date();

  protected readonly dialogOpen = signal(false);
  protected readonly dialogType = signal<CashFlowType>('receita');

  protected readonly quickActions: QuickAction[] = [
    { label: 'Registrar Receita', description: 'Lançar entrada no fluxo de caixa', icon: 'arrow-up-right', type: 'receita' },
    { label: 'Registrar Despesa', description: 'Lançar saída no fluxo de caixa', icon: 'arrow-down-right', type: 'despesa' },
    { label: 'Fechar Caixa', description: 'Conferir e encerrar o turno', icon: 'lock', route: '/fechamento-caixa' },
    { label: 'Gerar Relatório', description: 'Exportar relatório gerencial', icon: 'file-text' },
  ];

  protected readonly kpis = computed<Kpi[]>(() => [
    { label: 'Saldo em Caixa', value: this.cashFlow.saldoEmCaixa(), variation: 4.8, icon: 'dollar-sign', tone: 'primary' },
    { label: 'Receitas do Dia', value: this.cashFlow.receitasDoDia(), variation: 12.1, icon: 'trending-up', tone: 'success' },
    { label: 'Despesas do Dia', value: this.cashFlow.despesasDoDia(), variation: -6.4, icon: 'credit-card', tone: 'danger' },
    { label: 'Faturamento do Mês', value: this.cashFlow.faturamentoDoMes(), variation: 8.3, icon: 'bar-chart', tone: 'warning' },
  ]);

  protected readonly categoryBreakdown = computed<CategoryBreakdown[]>(() => {
    const totals = new Map<string, number>();

    for (const entry of this.cashFlow.todayEntries()) {
      const signedValue = entry.type === 'receita' ? entry.value : -entry.value;
      totals.set(entry.category, (totals.get(entry.category) ?? 0) + signedValue);
    }

    const maxAbsolute = Math.max(1, ...Array.from(totals.values(), Math.abs));

    return Array.from(totals.entries())
      .map(([category, value]) => ({
        category,
        value,
        percentage: Math.round((Math.abs(value) / maxAbsolute) * 100),
      }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  });

  openDialog(type: CashFlowType = 'receita'): void {
    this.dialogType.set(type);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  runQuickAction(action: QuickAction): void {
    if (action.type) {
      this.openDialog(action.type);
    } else if (action.route) {
      this.router.navigateByUrl(action.route);
    }
  }
}
