import { Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ReservationService } from '../../core/services/reservation.service';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const checkIn = control.get('checkIn')?.value;
  const checkOut = control.get('checkOut')?.value;

  if (!checkIn || !checkOut) {
    return null;
  }

  return checkOut > checkIn ? null : { invalidRange: true };
}

@Component({
  selector: 'app-new-reservation-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Modal, Icon],
  templateUrl: './new-reservation-dialog.html',
  styleUrl: './new-reservation-dialog.scss',
})
export class NewReservationDialog {
  private readonly fb = inject(FormBuilder);
  private readonly reservationService = inject(ReservationService);

  readonly closed = output<void>();

  protected readonly rooms = this.reservationService.rooms;
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly roomConflict = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      guestName: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      room: ['', Validators.required],
      checkIn: [this.todayIsoDate(), Validators.required],
      checkOut: [this.todayIsoDate(1), Validators.required],
      guestsCount: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      notes: [''],
    },
    { validators: dateRangeValidator },
  );

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    this.submitted.set(true);
    this.roomConflict.set(false);
    this.saveError.set(null);

    if (this.form.invalid || this.saving()) {
      return;
    }

    const { guestName, cpf, room, checkIn, checkOut, guestsCount, notes } = this.form.getRawValue();
    const roomId = Number(room);
    const checkInDate = this.parseDate(checkIn, 14, 0);
    const checkOutDate = this.parseDate(checkOut, 12, 0);

    if (!this.reservationService.isRoomAvailable(roomId, checkInDate, checkOutDate)) {
      this.roomConflict.set(true);
      return;
    }

    this.saving.set(true);

    this.reservationService.addReservation({
        guestName: guestName.trim(),
        cpf,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestsCount,
        notes: notes.trim(),
      }).subscribe({
        next: () => {
          this.saving.set(false);
          this.closed.emit();
        },
        error: (error: HttpErrorResponse) => {
          this.saving.set(false);
          if (error.status === 409) {
            this.roomConflict.set(true);
          } else {
            this.saveError.set('Não foi possível salvar a reserva. Tente novamente.');
          }
        },
      });
  }

  private parseDate(iso: string, hours: number, minutes: number): Date {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private todayIsoDate(offsetDays = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
