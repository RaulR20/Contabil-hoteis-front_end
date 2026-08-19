import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';

interface Kpi {
  label: string;
  value: number;
  variation: number;
  icon: string;
  tone: 'primary' | 'success' | 'danger' | 'warning';
}

interface CashFlowEntry {
  description: string;
  category: string;
  type: 'receita' | 'despesa';
  value: number;
  date: Date;
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
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly today = new Date();

  protected readonly kpis: Kpi[] = [
    { label: 'Saldo em Caixa', value: 48750.32, variation: 4.8, icon: 'dollar-sign', tone: 'primary' },
    { label: 'Receitas do Dia', value: 12980.0, variation: 12.1, icon: 'trending-up', tone: 'success' },
    { label: 'Despesas do Dia', value: 3120.5, variation: -6.4, icon: 'credit-card', tone: 'danger' },
    { label: 'Faturamento do Mês', value: 187430.9, variation: 8.3, icon: 'bar-chart', tone: 'warning' },
  ];

  protected readonly quickActions: QuickAction[] = [
    { label: 'Registrar Receita', description: 'Lançar entrada no fluxo de caixa', icon: 'arrow-up-right' },
    { label: 'Registrar Despesa', description: 'Lançar saída no fluxo de caixa', icon: 'arrow-down-right' },
    { label: 'Fechar Caixa', description: 'Conferir e encerrar o turno', icon: 'lock' },
    { label: 'Gerar Relatório', description: 'Exportar relatório gerencial', icon: 'file-text' },
  ];

  protected readonly cashFlow: CashFlowEntry[] = [
    {
      description: 'Faturamento reserva #101 - João Silva',
      category: 'Hospedagem',
      type: 'receita',
      value: 875.0,
      date: new Date(2026, 7, 18, 9, 20),
    },
    {
      description: 'Consumo Frigobar - Quarto 204',
      category: 'Consumo de Serviços',
      type: 'receita',
      value: 45.0,
      date: new Date(2026, 7, 18, 10, 5),
    },
    {
      description: 'Compra de material de limpeza',
      category: 'Manutenção',
      type: 'despesa',
      value: 320.9,
      date: new Date(2026, 7, 18, 11, 40),
    },
    {
      description: 'Pagamento lavanderia terceirizada',
      category: 'Serviços Terceirizados',
      type: 'despesa',
      value: 610.0,
      date: new Date(2026, 7, 18, 13, 15),
    },
    {
      description: 'Faturamento reserva #108 - Ana Costa',
      category: 'Hospedagem',
      type: 'receita',
      value: 1240.0,
      date: new Date(2026, 7, 18, 14, 50),
    },
  ];

  protected readonly guests: GuestStatus[] = [
    { guest: 'João Silva', room: '204', status: 'Hospedado', amount: 875.0 },
    { guest: 'Ana Costa', room: '108', status: 'Faturado', amount: 1240.0 },
    { guest: 'Marcos Lima', room: '312', status: 'Pago', amount: 640.5 },
    { guest: 'Beatriz Rocha', room: '117', status: 'Pendente', amount: 430.0 },
  ];

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
