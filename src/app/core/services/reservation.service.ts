import { Injectable, computed, signal } from '@angular/core';

export type ReservationStatus = 'Reserva Criada' | 'Confirmada' | 'Cancelada';

export interface Reservation {
  id: string;
  guestName: string;
  cpf: string;
  room: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  notes: string;
  status: ReservationStatus;
}

export interface NewReservation {
  guestName: string;
  cpf: string;
  room: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  notes: string;
}

export const ROOMS = [
  '101 - Standard',
  '102 - Standard',
  '108 - Suíte',
  '117 - Standard',
  '204 - Luxo',
  '211 - Standard',
  '305 - Luxo',
  '312 - Suíte',
];

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(14, 0, 0, 0);
  return date;
}

function seedReservations(): Reservation[] {
  return [
    {
      id: crypto.randomUUID(),
      guestName: 'João Silva',
      cpf: '123.456.789-00',
      room: '204 - Luxo',
      checkIn: daysFromNow(-1),
      checkOut: daysFromNow(2),
      guestsCount: 2,
      notes: 'Hóspede recorrente, prefere andar alto.',
      status: 'Confirmada',
    },
    {
      id: crypto.randomUUID(),
      guestName: 'Ana Costa',
      cpf: '987.654.321-00',
      room: '108 - Suíte',
      checkIn: daysFromNow(-2),
      checkOut: daysFromNow(1),
      guestsCount: 1,
      notes: '',
      status: 'Confirmada',
    },
    {
      id: crypto.randomUUID(),
      guestName: 'Marcos Lima',
      cpf: '456.789.123-00',
      room: '312 - Suíte',
      checkIn: daysFromNow(3),
      checkOut: daysFromNow(6),
      guestsCount: 2,
      notes: 'Aguardando confirmação de pagamento.',
      status: 'Reserva Criada',
    },
    {
      id: crypto.randomUUID(),
      guestName: 'Beatriz Rocha',
      cpf: '321.654.987-00',
      room: '117 - Standard',
      checkIn: daysFromNow(5),
      checkOut: daysFromNow(7),
      guestsCount: 1,
      notes: '',
      status: 'Reserva Criada',
    },
    {
      id: crypto.randomUUID(),
      guestName: 'Carlos Eduardo',
      cpf: '789.123.456-00',
      room: '101 - Standard',
      checkIn: daysFromNow(-5),
      checkOut: daysFromNow(-3),
      guestsCount: 1,
      notes: 'Cliente desistiu da viagem.',
      status: 'Cancelada',
    },
    {
      id: crypto.randomUUID(),
      guestName: 'Fernanda Duarte',
      cpf: '234.567.891-00',
      room: '102 - Standard',
      checkIn: daysFromNow(0),
      checkOut: daysFromNow(3),
      guestsCount: 1,
      notes: 'Chegada prevista para hoje.',
      status: 'Confirmada',
    },
    {
      id: crypto.randomUUID(),
      guestName: 'Ricardo Nunes',
      cpf: '345.678.912-00',
      room: '305 - Luxo',
      checkIn: daysFromNow(-3),
      checkOut: daysFromNow(0),
      guestsCount: 2,
      notes: 'Saída prevista para hoje.',
      status: 'Confirmada',
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly reservationsSignal = signal<Reservation[]>(seedReservations());

  readonly reservations = computed(() =>
    [...this.reservationsSignal()].sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime()),
  );

  readonly total = computed(() => this.reservationsSignal().length);

  readonly confirmadas = computed(
    () => this.reservationsSignal().filter((r) => r.status === 'Confirmada').length,
  );

  readonly pendentes = computed(
    () => this.reservationsSignal().filter((r) => r.status === 'Reserva Criada').length,
  );

  readonly canceladas = computed(
    () => this.reservationsSignal().filter((r) => r.status === 'Cancelada').length,
  );

  addReservation(reservation: NewReservation): void {
    const newReservation: Reservation = {
      id: crypto.randomUUID(),
      status: 'Reserva Criada',
      ...reservation,
    };
    this.reservationsSignal.update((list) => [newReservation, ...list]);
  }

  updateStatus(id: string, status: ReservationStatus): void {
    this.reservationsSignal.update((list) =>
      list.map((reservation) => (reservation.id === id ? { ...reservation, status } : reservation)),
    );
  }

  isRoomAvailable(room: string, checkIn: Date, checkOut: Date, excludeId?: string): boolean {
    return !this.reservationsSignal().some(
      (reservation) =>
        reservation.id !== excludeId &&
        reservation.room === room &&
        reservation.status !== 'Cancelada' &&
        checkIn < reservation.checkOut &&
        checkOut > reservation.checkIn,
    );
  }
}
