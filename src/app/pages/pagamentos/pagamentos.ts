import { Component } from '@angular/core';
import { Icon } from '../../shared/icon/icon';

interface PaymentMethod {
  label: string;
  description: string;
  icon: string;
  status: 'planejado' | 'em-desenvolvimento';
}

interface Integration {
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [Icon],
  templateUrl: './pagamentos.html',
  styleUrl: './pagamentos.scss',
})
export class Pagamentos {
  protected readonly methods: PaymentMethod[] = [
    {
      label: 'Cartão de Crédito / Débito',
      description: 'Pagamentos processados via maquininha ou gateway integrado.',
      icon: 'credit-card',
      status: 'em-desenvolvimento',
    },
    {
      label: 'Dinheiro',
      description: 'Recebimentos em espécie, conciliados no fechamento de caixa.',
      icon: 'banknote',
      status: 'planejado',
    },
    {
      label: 'Pix',
      description: 'Pagamento instantâneo com confirmação automática via API do banco.',
      icon: 'zap',
      status: 'planejado',
    },
    {
      label: 'Boleto Bancário',
      description: 'Emissão e baixa automática de boletos para faturas de hóspedes.',
      icon: 'file-text',
      status: 'planejado',
    },
  ];

  protected readonly integrations: Integration[] = [
    {
      label: 'Gateway de Pagamento',
      description: 'Integração com APIs de adquirentes para captura e conciliação automática.',
      icon: 'globe',
    },
    {
      label: 'Sistema Bancário',
      description: 'Conciliação bancária automatizada com extratos e recebíveis.',
      icon: 'check-circle',
    },
  ];

  protected statusLabel(status: PaymentMethod['status']): string {
    return status === 'em-desenvolvimento' ? 'Em desenvolvimento' : 'Planejado';
  }
}
