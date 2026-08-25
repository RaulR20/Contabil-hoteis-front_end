import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

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

/**
 * Fonte de dados mockada — hoje simula uma chamada de API (delay + Observable).
 * Quando o endpoint real existir, basta trocar o corpo destes métodos por
 * chamadas HttpClient (ex.: `this.http.get<Guest[]>('/api/hospedes')`),
 * sem alterar o contrato consumido pelos componentes.
 */
function seedGuests(): Guest[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Patrícia Andrade',
      cpf: '111.222.333-01',
      email: 'patricia.andrade@email.com',
      phone: '(11) 91234-5678',
      stays: [
        {
          id: crypto.randomUUID(),
          room: '204 - Luxo',
          checkIn: new Date(2026, 4, 10),
          checkOut: new Date(2026, 4, 13),
          totalSpent: 2145.0,
        },
        {
          id: crypto.randomUUID(),
          room: '108 - Suíte',
          checkIn: new Date(2026, 6, 2),
          checkOut: new Date(2026, 6, 5),
          totalSpent: 2670.0,
        },
        {
          id: crypto.randomUUID(),
          room: '204 - Luxo',
          checkIn: new Date(2026, 7, 1),
          checkOut: new Date(2026, 7, 3),
          totalSpent: 1430.0,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Eduardo Martins',
      cpf: '222.333.444-02',
      email: 'eduardo.martins@email.com',
      phone: '(21) 98877-6655',
      stays: [
        {
          id: crypto.randomUUID(),
          room: '312 - Suíte',
          checkIn: new Date(2026, 5, 14),
          checkOut: new Date(2026, 5, 18),
          totalSpent: 3320.0,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Camila Ferreira',
      cpf: '333.444.555-03',
      email: 'camila.ferreira@email.com',
      phone: '(31) 99765-4321',
      stays: [
        {
          id: crypto.randomUUID(),
          room: '101 - Standard',
          checkIn: new Date(2026, 3, 22),
          checkOut: new Date(2026, 3, 24),
          totalSpent: 780.0,
        },
        {
          id: crypto.randomUUID(),
          room: '102 - Standard',
          checkIn: new Date(2026, 6, 20),
          checkOut: new Date(2026, 6, 23),
          totalSpent: 1145.0,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Rafael Souza',
      cpf: '444.555.666-04',
      email: 'rafael.souza@email.com',
      phone: '(41) 98123-4567',
      stays: [
        {
          id: crypto.randomUUID(),
          room: '211 - Standard',
          checkIn: new Date(2026, 2, 5),
          checkOut: new Date(2026, 2, 7),
          totalSpent: 690.0,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Juliana Prado',
      cpf: '555.666.777-05',
      email: 'juliana.prado@email.com',
      phone: '(51) 99456-7890',
      stays: [
        {
          id: crypto.randomUUID(),
          room: '305 - Luxo',
          checkIn: new Date(2026, 1, 12),
          checkOut: new Date(2026, 1, 15),
          totalSpent: 2280.0,
        },
        {
          id: crypto.randomUUID(),
          room: '108 - Suíte',
          checkIn: new Date(2026, 5, 1),
          checkOut: new Date(2026, 5, 4),
          totalSpent: 2610.0,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Thiago Barbosa',
      cpf: '666.777.888-06',
      email: 'thiago.barbosa@email.com',
      phone: '(61) 98234-5566',
      stays: [
        {
          id: crypto.randomUUID(),
          room: '117 - Standard',
          checkIn: new Date(2026, 6, 8),
          checkOut: new Date(2026, 6, 9),
          totalSpent: 385.0,
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Larissa Nogueira',
      cpf: '777.888.999-07',
      email: 'larissa.nogueira@email.com',
      phone: '(85) 99987-6543',
      stays: [
        {
          id: crypto.randomUUID(),
          room: '312 - Suíte',
          checkIn: new Date(2026, 4, 20),
          checkOut: new Date(2026, 4, 25),
          totalSpent: 4150.0,
        },
      ],
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class GuestService {
  list(): Observable<Guest[]> {
    return of(seedGuests()).pipe(delay(350));
  }

  getById(id: string): Observable<Guest | undefined> {
    return this.list().pipe(map((guests) => guests.find((guest) => guest.id === id)));
  }
}
