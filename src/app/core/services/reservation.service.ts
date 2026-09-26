import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, map, tap } from 'rxjs';
import { ApiService } from './api.service';

export type ReservationStatus =
  | 'Reserva Criada' | 'Confirmada' | 'Em hospedagem' | 'Finalizada' | 'Cancelada';

export interface Room {
  id: number;
  number: string;
  category: string;
  nightlyRate: number;
  status: string;
  label: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  cpf: string;
  room: string;
  roomId: number;
  nightlyRate: number;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  notes: string;
  status: ReservationStatus;
}

export interface NewReservation {
  guestName: string;
  cpf: string;
  roomId: number;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  notes: string;
}

interface ApiReservation {
  id: number;
  guestName: string;
  documentNumber: string;
  room: string;
  roomId: number;
  nightlyRate: number;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  notes: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
}

interface ApiRoom {
  id: number;
  number: string;
  category: string;
  nightlyRate: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly api = inject(ApiService);
  private readonly reservationsSignal = signal<Reservation[]>([]);
  private readonly roomsSignal = signal<Room[]>([]);
  readonly rooms = computed(() => this.roomsSignal().filter((room) => room.status === 'AVAILABLE'));
  readonly reservations = computed(() =>
    [...this.reservationsSignal()].sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime()));
  readonly total = computed(() => this.reservationsSignal().length);
  readonly confirmadas = computed(() =>
    this.reservationsSignal().filter((r) => r.status === 'Confirmada' || r.status === 'Em hospedagem').length);
  readonly pendentes = computed(() =>
    this.reservationsSignal().filter((r) => r.status === 'Reserva Criada').length);
  readonly canceladas = computed(() =>
    this.reservationsSignal().filter((r) => r.status === 'Cancelada').length);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      reservations: this.api.get<ApiReservation[]>(this.api.hotelPath('reservations')),
      rooms: this.api.get<ApiRoom[]>(this.api.hotelPath('rooms')),
    }).subscribe({
      next: ({ reservations, rooms }) => {
        this.reservationsSignal.set(reservations.map((row) => this.fromApi(row)));
        this.roomsSignal.set(rooms.map((room) => ({
          ...room, label: `${room.number} - ${room.category}`,
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar reservas e quartos do servidor.');
        this.loading.set(false);
      },
    });
  }

  addReservation(reservation: NewReservation): Observable<Reservation> {
    const body = {
      guestName: reservation.guestName,
      documentNumber: reservation.cpf,
      roomId: reservation.roomId,
      checkIn: this.dateOnly(reservation.checkIn),
      checkOut: this.dateOnly(reservation.checkOut),
      guestsCount: reservation.guestsCount,
      notes: reservation.notes,
    };
    return this.api.post<ApiReservation>(this.api.hotelPath('reservations'), body).pipe(
      map((row) => this.fromApi(row)),
      tap((created) => this.reservationsSignal.update((rows) => [created, ...rows])),
    );
  }

  updateStatus(id: string, status: ReservationStatus): Observable<Reservation> {
    const code = this.toApiStatus(status);
    return this.api.patch<ApiReservation>(
      this.api.hotelPath(`reservations/${id}/status`), { status: code },
    ).pipe(
      map((row) => this.fromApi(row)),
      tap((updated) => this.reservationsSignal.update((rows) =>
        rows.map((row) => row.id === id ? updated : row))),
    );
  }

  isRoomAvailable(roomId: number, checkIn: Date, checkOut: Date): boolean {
    return !this.reservationsSignal().some((reservation) =>
      reservation.roomId === roomId && reservation.status !== 'Cancelada'
      && checkIn < reservation.checkOut && checkOut > reservation.checkIn);
  }

  private fromApi(row: ApiReservation): Reservation {
    const statuses: Record<ApiReservation['status'], ReservationStatus> = {
      PENDING: 'Reserva Criada',
      CONFIRMED: 'Confirmada',
      CHECKED_IN: 'Em hospedagem',
      CHECKED_OUT: 'Finalizada',
      CANCELLED: 'Cancelada',
    };
    return {
      id: String(row.id),
      guestName: row.guestName,
      cpf: row.documentNumber ?? '',
      room: row.room,
      roomId: row.roomId,
      nightlyRate: Number(row.nightlyRate),
      checkIn: this.parseDate(row.checkIn),
      checkOut: this.parseDate(row.checkOut),
      guestsCount: row.guestsCount,
      notes: row.notes ?? '',
      status: statuses[row.status],
    };
  }

  private toApiStatus(status: ReservationStatus): ApiReservation['status'] {
    const statuses: Record<ReservationStatus, ApiReservation['status']> = {
      'Reserva Criada': 'PENDING',
      'Confirmada': 'CONFIRMED',
      'Em hospedagem': 'CHECKED_IN',
      'Finalizada': 'CHECKED_OUT',
      'Cancelada': 'CANCELLED',
    };
    return statuses[status];
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  }

  private dateOnly(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const from = Date.UTC(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const to = Date.UTC(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  return Math.max(1, Math.round((to - from) / 86_400_000));
}

export function estimatedValue(reservation: Pick<Reservation, 'nightlyRate' | 'checkIn' | 'checkOut'>): number {
  return reservation.nightlyRate * nightsBetween(reservation.checkIn, reservation.checkOut);
}
