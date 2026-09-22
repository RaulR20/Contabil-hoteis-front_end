import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';
import { AuthService } from '../../core/auth/auth.service';

export const CASH_DEPOSIT_ORIGINS = [
  'Suprimento de Caixa',
  'Troco Inicial',
  'Recebimento em Espécie',
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

  readonly closed = output<void>();

  protected readonly origins = CASH_DEPOSIT_ORIGINS;
  protected readonly responsible = this.auth.user()?.name ?? 'Usuário';

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
