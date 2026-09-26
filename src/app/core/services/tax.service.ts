import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';

export type TaxRegime = 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
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

interface ApiTax extends Omit<Tax, 'id'> { id: number; }
interface TaxConfig { regime: TaxRegime; taxes: ApiTax[]; }

export const TAX_REGIMES: TaxRegime[] = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'];
export const TAX_BASES: TaxBase[] = ['Receita Bruta', 'Hospedagem', 'Consumo de Serviços'];

@Injectable({ providedIn: 'root' })
export class TaxService {
  private readonly api = inject(ApiService);
  private readonly taxesSignal = signal<Tax[]>([]);
  readonly taxes = this.taxesSignal.asReadonly();
  readonly regime = signal<TaxRegime>('Lucro Presumido');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<TaxConfig>(this.api.hotelPath('taxes')).subscribe({
      next: (config) => {
        this.regime.set(config.regime);
        this.taxesSignal.set(config.taxes.map((tax) => this.fromApi(tax)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os impostos configurados.');
        this.loading.set(false);
      },
    });
  }

  addTax(tax: NewTax): Observable<Tax> {
    return this.api.post<ApiTax>(this.api.hotelPath('taxes'), tax).pipe(
      map((row) => this.fromApi(row)),
      tap((created) => this.taxesSignal.update((rows) => [...rows, created])),
    );
  }

  updateRate(id: string, rate: number): void {
    this.update(id, { rate });
  }

  toggleActive(id: string): void {
    const current = this.taxesSignal().find((tax) => tax.id === id);
    if (current) this.update(id, { active: !current.active });
  }

  removeTax(id: string): void {
    this.error.set(null);
    this.api.delete<void>(this.api.hotelPath(`taxes/${id}`)).subscribe({
      next: () => this.taxesSignal.update((rows) => rows.filter((tax) => tax.id !== id)),
      error: () => this.error.set('Não foi possível remover o tributo.'),
    });
  }

  setRegime(regime: TaxRegime): void {
    this.error.set(null);
    this.api.put<void>(this.api.hotelPath('tax-regime'), { regime }).subscribe({
      next: () => this.regime.set(regime),
      error: () => this.error.set('Não foi possível atualizar o regime.'),
    });
  }

  private update(id: string, values: { rate?: number; active?: boolean }): void {
    this.error.set(null);
    this.api.patch<ApiTax>(this.api.hotelPath(`taxes/${id}`), values).subscribe({
      next: (row) => this.taxesSignal.update((rows) =>
        rows.map((tax) => tax.id === id ? this.fromApi(row) : tax)),
      error: () => this.error.set('Não foi possível atualizar o tributo.'),
    });
  }

  private fromApi(row: ApiTax): Tax {
    return { ...row, id: String(row.id), rate: Number(row.rate) };
  }
}
