import { Component, computed, inject } from '@angular/core';
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

  protected readonly arrivals = computed(() =>
    this.reservationService
      .reservations()
      .filter((r) => r.status === 'Confirmada' && this.isSameDay(r.checkIn, new Date())),
  );

  protected readonly departures = computed(() =>
    this.reservationService
      .reservations()
      .filter((r) => r.status === 'Confirmada' && this.isSameDay(r.checkOut, new Date())),
  );

  protected readonly inHouse = computed(() => {
    const now = new Date();
    return this.reservationService
      .reservations()
      .filter(
        (r) =>
          r.status === 'Confirmada' &&
          r.checkIn < now &&
          r.checkOut > now &&
          !this.isSameDay(r.checkIn, now) &&
          !this.isSameDay(r.checkOut, now),
      );
  });

  protected trackById(_: number, reservation: Reservation): string {
    return reservation.id;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
}
