import { Component, inject, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';
import { AuthService } from '../../core/auth/auth.service';
import { CashDepositService } from '../../core/services/cash-deposit.service';

export const CASH_DEPOSIT_ORIGINS = [
  'Suprimento de Caixa',
  'Troco Inicial',
  'Transferência entre Turnos',
  'Aporte do Sócio',
  'Outros',
];

@Component({
  selector: 'app-cash-deposit-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Modal, Icon],
  templateUrl: './cash-deposit-dialog.html',
  styleUrl: './cash-deposit-dialog.scss',
})
export class CashDepositDialog {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly deposits = inject(CashDepositService);

  readonly closed = output<void>();

  protected readonly origins = CASH_DEPOSIT_ORIGINS;
  protected readonly responsible = this.auth.user()?.name ?? 'Usuário';
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    origin: ['', Validators.required],
    date: [this.todayIsoDate(), Validators.required],
    time: [this.nowIsoTime(), Validators.required],
    notes: [''],
  });

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) return;
    const { amount, origin, date, time, notes } = this.form.getRawValue();
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    this.saveError.set(null);
    this.saving.set(true);
    this.deposits.add({
      amount: amount ?? 0,
      origin,
      notes: notes.trim(),
      occurredAt: new Date(year, month - 1, day, hours, minutes),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.closed.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.saveError.set(error.status === 409
          ? 'O caixa dessa data já foi fechado.'
          : 'Não foi possível registrar a entrada.');
      },
    });
  }

  private todayIsoDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private nowIsoTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
}
