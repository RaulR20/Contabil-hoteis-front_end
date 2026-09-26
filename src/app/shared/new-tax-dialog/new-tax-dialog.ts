import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';
import { TAX_BASES, TaxBase, TaxService } from '../../core/services/tax.service';

@Component({
  selector: 'app-new-tax-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Modal, Icon],
  templateUrl: './new-tax-dialog.html',
  styleUrl: './new-tax-dialog.scss',
})
export class NewTaxDialog {
  private readonly fb = inject(FormBuilder);
  private readonly taxService = inject(TaxService);

  readonly closed = output<void>();

  protected readonly bases = TAX_BASES;
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(20)]],
    description: [''],
    rate: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    base: ['Receita Bruta' as TaxBase, Validators.required],
  });

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      return;
    }

    const { name, description, rate, base } = this.form.getRawValue();

    this.saving.set(true);
    this.saveError.set(null);
    this.taxService.addTax({
      name: name.trim().toUpperCase(),
      description: description.trim(),
      rate: rate ?? 0,
      base,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.closed.emit();
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Não foi possível salvar o tributo.');
      },
    });
  }
}
