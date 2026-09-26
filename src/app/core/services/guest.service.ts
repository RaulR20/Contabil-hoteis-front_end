import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface GuestStay {
  id: string;
  room: string;
  checkIn: Date;
  checkOut: Date;
  totalSpent: number;
}

export interface Guest {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  stays: GuestStay[];
}

interface ApiGuest {
  id: number;
  name: string;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  stays: {
    id: number;
    room: string;
    checkIn: string;
    checkOut: string;
    estimatedTotal: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly api = inject(ApiService);

  list(): Observable<Guest[]> {
    return this.api.get<ApiGuest[]>(this.api.hotelPath('guests/history')).pipe(
      map((guests) => guests.map((guest) => ({
        id: String(guest.id),
        name: guest.name,
        cpf: guest.documentNumber ?? '',
        email: guest.email ?? '',
        phone: guest.phone ?? '',
        stays: guest.stays.map((stay) => ({
          id: String(stay.id),
          room: stay.room,
          checkIn: this.parseDate(stay.checkIn),
          checkOut: this.parseDate(stay.checkOut),
          totalSpent: Number(stay.estimatedTotal),
        })),
      }))),
    );
  }

  getById(id: string): Observable<Guest | undefined> {
    return this.list().pipe(map((guests) => guests.find((guest) => guest.id === id)));
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
