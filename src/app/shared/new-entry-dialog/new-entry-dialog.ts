import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CashFlowService,
  CashFlowType,
  DESPESA_CATEGORIES,
  PAYMENT_METHODS,
  PaymentMethod,
  RECEITA_CATEGORIES,
  paymentMethodIcon,
} from '../../core/services/cash-flow.service';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-new-entry-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Modal, Icon],
  templateUrl: './new-entry-dialog.html',
  styleUrl: './new-entry-dialog.scss',
})
export class NewEntryDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cashFlow = inject(CashFlowService);

  readonly initialType = input<CashFlowType>('receita');
  readonly closed = output<void>();

  protected readonly type = signal<CashFlowType>('receita');
  protected readonly paymentMethod = signal<PaymentMethod>('Cartão');
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    value: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [this.todayIsoDate(), Validators.required],
    time: [this.nowIsoTime(), Validators.required],
  });

  protected readonly categories = computed(() =>
    this.type() === 'receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES,
  );

  ngOnInit(): void {
    this.type.set(this.initialType());
  }

  setType(type: CashFlowType): void {
    this.type.set(type);
    this.form.controls.category.setValue('');
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  protected readonly paymentMethodIcon = paymentMethodIcon;

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    this.submitted.set(true);

    if (this.form.invalid || this.saving()) {
      return;
    }

    const { description, category, value, date, time } = this.form.getRawValue();
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    this.saving.set(true);

    setTimeout(() => {
      this.cashFlow.addEntry({
        type: this.type(),
        description: description.trim(),
        category,
        value: value ?? 0,
        date: new Date(year, month - 1, day, hours, minutes),
        paymentMethod: this.paymentMethod(),
      });
      this.saving.set(false);
      this.closed.emit();
    }, 400);
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
