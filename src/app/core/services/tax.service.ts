import { Injectable, signal } from '@angular/core';

export type TaxRegime = 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';

/** Base de cálculo — sobre qual receita a alíquota incide. */
export type TaxBase = 'Receita Bruta' | 'Hospedagem' | 'Consumo de Serviços';

export interface Tax {
  id: string;
  name: string;
  description: string;
  rate: number;
  base: TaxBase;
  active: boolean;
}

export interface NewTax {
  name: string;
  description: string;
  rate: number;
  base: TaxBase;
}

export const TAX_REGIMES: TaxRegime[] = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'];
export const TAX_BASES: TaxBase[] = ['Receita Bruta', 'Hospedagem', 'Consumo de Serviços'];

/** Alíquotas padrão do Lucro Presumido para serviços de hospedagem. */
function seedTaxes(): Tax[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'ISS',
      description: 'Imposto Sobre Serviços — municipal, incide sobre diárias e serviços',
      rate: 5,
      base: 'Hospedagem',
      active: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'PIS',
      description: 'Programa de Integração Social — regime cumulativo',
      rate: 0.65,
      base: 'Receita Bruta',
      active: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'COFINS',
      description: 'Contribuição para o Financiamento da Seguridade Social — regime cumulativo',
      rate: 3,
      base: 'Receita Bruta',
      active: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'IRPJ',
      description: 'Imposto de Renda Pessoa Jurídica — 15% sobre presunção de 32%',
      rate: 4.8,
      base: 'Receita Bruta',
      active: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'CSLL',
      description: 'Contribuição Social sobre o Lucro Líquido — 9% sobre presunção de 32%',
      rate: 2.88,
      base: 'Receita Bruta',
      active: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'Taxa de Turismo',
      description: 'Taxa municipal por diária — varia conforme o município',
      rate: 1,
      base: 'Hospedagem',
      active: false,
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class TaxService {
  private readonly taxesSignal = signal<Tax[]>(seedTaxes());

  readonly taxes = this.taxesSignal.asReadonly();
  readonly regime = signal<TaxRegime>('Lucro Presumido');

  addTax(tax: NewTax): void {
    this.taxesSignal.update((taxes) => [...taxes, { id: crypto.randomUUID(), active: true, ...tax }]);
  }

  updateRate(id: string, rate: number): void {
    this.taxesSignal.update((taxes) =>
      taxes.map((tax) => (tax.id === id ? { ...tax, rate } : tax)),
    );
  }

  toggleActive(id: string): void {
    this.taxesSignal.update((taxes) =>
      taxes.map((tax) => (tax.id === id ? { ...tax, active: !tax.active } : tax)),
    );
  }

  removeTax(id: string): void {
    this.taxesSignal.update((taxes) => taxes.filter((tax) => tax.id !== id));
  }
}
