import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Icon } from '../../shared/icon/icon';
import { CashDepositDialog } from '../../shared/cash-deposit-dialog/cash-deposit-dialog';
import { CashFlowService, paymentMethodIcon } from '../../core/services/cash-flow.service';
import { CashDepositService } from '../../core/services/cash-deposit.service';
import { CashClosing, CashClosingService } from '../../core/services/cash-closing.service';

@Component({
  selector: 'app-fechamento-caixa',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, Icon, CashDepositDialog],
  templateUrl: './fechamento-caixa.html',
  styleUrl: './fechamento-caixa.scss',
})
export class FechamentoCaixa {
  private readonly fb = inject(FormBuilder);

  protected readonly cashFlow = inject(CashFlowService);
  protected readonly deposits = inject(CashDepositService);
  protected readonly closingService = inject(CashClosingService);
  protected readonly paymentMethodIcon = paymentMethodIcon;

  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly depositDialogOpen = signal(false);

  protected readonly cashEntriesToday = computed(() =>
    this.cashFlow.todayEntries().filter((entry) => entry.paymentMethod === 'Dinheiro'),
  );

  protected readonly expectedAmount = computed(() =>
    this.cashFlow.dinheiroEmCaixaHoje() + this.deposits.todayAmount());

  protected readonly form = this.fb.nonNullable.group({
    countedAmount: [null as number | null, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  private readonly countedAmountSignal = toSignal(
    this.form.controls.countedAmount.valueChanges.pipe(
      startWith(this.form.controls.countedAmount.value),
    ),
    { initialValue: null },
  );

  protected readonly previewDifference = computed(() => {
    const counted = this.countedAmountSignal();
    return counted === null ? null : counted - this.expectedAmount();
  });

  openDepositDialog(): void {
    this.depositDialogOpen.set(true);
  }

  closeDepositDialog(): void {
    this.depositDialogOpen.set(false);
  }

  submit(): void {
    this.submitted.set(true);

    if (this.form.invalid || this.saving()) {
      return;
    }

    const { countedAmount, notes } = this.form.getRawValue();
    this.saveError.set(null);
    this.saving.set(true);
    this.closingService.close({ countedAmount: countedAmount ?? 0, notes: notes.trim() })
      .subscribe({
        next: () => this.saving.set(false),
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.saveError.set(error.status === 409
            ? 'O caixa de hoje já foi fechado.'
            : 'Não foi possível fechar o caixa. Tente novamente.');
        },
      });
  }

  protected differenceStatus(closing: CashClosing): 'confere' | 'sobra' | 'falta' {
    if (closing.difference === 0) return 'confere';
    return closing.difference > 0 ? 'sobra' : 'falta';
  }

  protected statusLabel(status: 'confere' | 'sobra' | 'falta'): string {
    switch (status) {
      case 'confere':
        return 'Confere';
      case 'sobra':
        return 'Sobra';
      default:
        return 'Falta';
    }
  }
}
