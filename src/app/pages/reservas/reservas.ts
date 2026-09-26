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
  protected readonly actionError = signal<string | null>(null);
  protected readonly savingId = signal<string | null>(null);

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
    this.changeStatus(reservation, 'Confirmada');
  }

  cancel(reservation: Reservation): void {
    this.changeStatus(reservation, 'Cancelada');
  }

  private changeStatus(reservation: Reservation, status: Reservation['status']): void {
    this.actionError.set(null);
    this.savingId.set(reservation.id);
    this.reservationService.updateStatus(reservation.id, status).subscribe({
      next: () => this.savingId.set(null),
      error: () => {
        this.savingId.set(null);
        this.actionError.set('Não foi possível atualizar a reserva. Tente novamente.');
      },
    });
  }

  protected statusTone(status: Reservation['status']): string {
    switch (status) {
      case 'Confirmada':
      case 'Em hospedagem':
      case 'Finalizada':
        return 'success';
      case 'Cancelada':
        return 'danger';
      default:
        return 'warning';
    }
  }
}
