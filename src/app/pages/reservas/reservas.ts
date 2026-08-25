import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import { NewReservationDialog } from '../../shared/new-reservation-dialog/new-reservation-dialog';
import { Reservation, ReservationService } from '../../core/services/reservation.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [DatePipe, Icon, NewReservationDialog],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
})
export class Reservas {
  protected readonly reservationService = inject(ReservationService);

  protected readonly dialogOpen = signal(false);
  protected readonly searchTerm = signal('');

  protected get filteredReservations(): Reservation[] {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.reservationService.reservations();

    if (!term) {
      return all;
    }

    return all.filter(
      (reservation) =>
        reservation.guestName.toLowerCase().includes(term) || reservation.room.toLowerCase().includes(term),
    );
  }

  openDialog(): void {
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  confirm(reservation: Reservation): void {
    this.reservationService.updateStatus(reservation.id, 'Confirmada');
  }

  cancel(reservation: Reservation): void {
    this.reservationService.updateStatus(reservation.id, 'Cancelada');
  }

  protected statusTone(status: Reservation['status']): string {
    switch (status) {
      case 'Confirmada':
        return 'success';
      case 'Cancelada':
        return 'danger';
      default:
        return 'warning';
    }
  }
}
