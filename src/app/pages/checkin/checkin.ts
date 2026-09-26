import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Icon } from '../../shared/icon/icon';
import { Reservation, ReservationService } from '../../core/services/reservation.service';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [DatePipe, Icon],
  templateUrl: './checkin.html',
  styleUrl: './checkin.scss',
})
export class Checkin {
  protected readonly reservationService = inject(ReservationService);
  protected readonly actionError = signal<string | null>(null);
  protected readonly savingId = signal<string | null>(null);

  protected readonly arrivals = computed(() =>
    this.reservationService
      .reservations()
      .filter((r) => r.status === 'Confirmada' && this.isDue(r.checkIn)),
  );

  protected readonly departures = computed(() =>
    this.reservationService
      .reservations()
      .filter((r) => r.status === 'Em hospedagem' && this.isDue(r.checkOut)),
  );

  protected readonly inHouse = computed(() => {
    return this.reservationService
      .reservations()
      .filter((r) => r.status === 'Em hospedagem');
  });

  checkIn(reservation: Reservation): void {
    this.changeStatus(reservation, 'Em hospedagem');
  }

  checkOut(reservation: Reservation): void {
    this.changeStatus(reservation, 'Finalizada');
  }

  private changeStatus(reservation: Reservation, status: Reservation['status']): void {
    this.actionError.set(null);
    this.savingId.set(reservation.id);
    this.reservationService.updateStatus(reservation.id, status).subscribe({
      next: () => this.savingId.set(null),
      error: () => {
        this.savingId.set(null);
        this.actionError.set('Não foi possível atualizar o check-in/check-out.');
      },
    });
  }

  protected trackById(_: number, reservation: Reservation): string {
    return reservation.id;
  }

  private isDue(date: Date): boolean {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return date <= endOfToday;
  }

}
