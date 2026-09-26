import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CashFlowService,
  CashFlowEntry,
  CashFlowType,
  DESPESA_CATEGORIES,
  PAYMENT_METHODS,
  PaymentMethod,
  RECEITA_CATEGORIES,
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
  readonly entry = input<CashFlowEntry | null>(null);
  readonly closed = output<void>();

  protected readonly type = signal<CashFlowType>('receita');
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    paymentMethod: ['Cartão de Crédito' as PaymentMethod, Validators.required],
    value: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [this.todayIsoDate(), Validators.required],
    time: [this.nowIsoTime(), Validators.required],
  });

  protected readonly categories = computed(() => {
    const choices = this.type() === 'receita' ? RECEITA_CATEGORIES : DESPESA_CATEGORIES;
    const previous = this.entry()?.category;
    return previous && !choices.includes(previous) ? [...choices, previous] : choices;
  });

  ngOnInit(): void {
    const current = this.entry();
    this.type.set(current?.type ?? this.initialType());
    if (current) {
      const date = current.date;
      this.form.setValue({
        description: current.description,
        category: current.category,
        paymentMethod: current.paymentMethod,
        value: current.value,
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      });
    }
  }

  setType(type: CashFlowType): void {
    this.type.set(type);
    this.form.controls.category.setValue('');
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    this.submitted.set(true);
    this.saveError.set(null);

    if (this.form.invalid || this.saving()) {
      return;
    }

    const { description, category, paymentMethod, value, date, time } = this.form.getRawValue();
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    this.saving.set(true);

    const payload = {
        type: this.type(),
        description: description.trim(),
        category,
        paymentMethod,
        value: value ?? 0,
        date: new Date(year, month - 1, day, hours, minutes),
      };
    const request = this.entry()
      ? this.cashFlow.updateEntry(this.entry()!.id, payload)
      : this.cashFlow.addEntry(payload);
    request.subscribe({
        next: () => {
          this.saving.set(false);
          this.closed.emit();
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          this.saveError.set(error.status === 409
            ? 'O caixa dessa data já foi fechado. Esse lançamento em dinheiro não pode ser alterado.'
            : 'Não foi possível salvar o lançamento. Tente novamente.');
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
