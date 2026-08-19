import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import { CashFlowService, CashFlowType } from '../../core/services/cash-flow.service';
import { NewEntryDialog } from '../../shared/new-entry-dialog/new-entry-dialog';

interface Kpi {
  label: string;
  value: number;
  variation: number;
  icon: string;
  tone: 'primary' | 'success' | 'danger' | 'warning';
}

interface GuestStatus {
  guest: string;
  room: string;
  status: 'Hospedado' | 'Faturado' | 'Pago' | 'Pendente';
  amount: number;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  type?: CashFlowType;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon, NewEntryDialog],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly cashFlow = inject(CashFlowService);

  protected readonly today = new Date();

  protected readonly dialogOpen = signal(false);
  protected readonly dialogType = signal<CashFlowType>('receita');

  protected readonly quickActions: QuickAction[] = [
    { label: 'Registrar Receita', description: 'Lançar entrada no fluxo de caixa', icon: 'arrow-up-right', type: 'receita' },
    { label: 'Registrar Despesa', description: 'Lançar saída no fluxo de caixa', icon: 'arrow-down-right', type: 'despesa' },
    { label: 'Fechar Caixa', description: 'Conferir e encerrar o turno', icon: 'lock' },
    { label: 'Gerar Relatório', description: 'Exportar relatório gerencial', icon: 'file-text' },
  ];

  protected readonly guests: GuestStatus[] = [
    { guest: 'João Silva', room: '204', status: 'Hospedado', amount: 875.0 },
    { guest: 'Ana Costa', room: '108', status: 'Faturado', amount: 1240.0 },
    { guest: 'Marcos Lima', room: '312', status: 'Pago', amount: 640.5 },
    { guest: 'Beatriz Rocha', room: '117', status: 'Pendente', amount: 430.0 },
  ];

  protected readonly kpis = computed<Kpi[]>(() => [
    { label: 'Saldo em Caixa', value: this.cashFlow.saldoEmCaixa(), variation: 4.8, icon: 'dollar-sign', tone: 'primary' },
    { label: 'Receitas do Dia', value: this.cashFlow.receitasDoDia(), variation: 12.1, icon: 'trending-up', tone: 'success' },
    { label: 'Despesas do Dia', value: this.cashFlow.despesasDoDia(), variation: -6.4, icon: 'credit-card', tone: 'danger' },
    { label: 'Faturamento do Mês', value: this.cashFlow.faturamentoDoMes(), variation: 8.3, icon: 'bar-chart', tone: 'warning' },
  ]);

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
    }
  }

  protected statusTone(status: GuestStatus['status']): string {
    switch (status) {
      case 'Pago':
        return 'success';
      case 'Pendente':
        return 'danger';
      case 'Faturado':
        return 'warning';
      default:
        return 'primary';
    }
  }
}
