import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Guest, GuestService } from '../../core/services/guest.service';
import { Icon } from '../../shared/icon/icon';
import { GuestDetailDialog } from '../../shared/guest-detail-dialog/guest-detail-dialog';

@Component({
  selector: 'app-hospedes',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Icon, GuestDetailDialog],
  templateUrl: './hospedes.html',
  styleUrl: './hospedes.scss',
})
export class Hospedes implements OnInit {
  private readonly guestService = inject(GuestService);

  protected readonly guests = signal<Guest[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly selectedGuest = signal<Guest | null>(null);

  protected readonly totalGuests = computed(() => this.guests().length);

  protected readonly recurringGuests = computed(
    () => this.guests().filter((guest) => guest.stays.length > 1).length,
  );

  protected readonly totalRevenue = computed(() =>
    this.guests().reduce((sum, guest) => sum + this.totalSpent(guest), 0),
  );

  protected readonly averageTicket = computed(() => {
    const totalStays = this.guests().reduce((sum, guest) => sum + guest.stays.length, 0);
    return totalStays > 0 ? this.totalRevenue() / totalStays : 0;
  });

  protected get filteredGuests(): Guest[] {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.guests();
    }

    return this.guests().filter(
      (guest) =>
        guest.name.toLowerCase().includes(term) ||
        guest.cpf.includes(term) ||
        guest.email.toLowerCase().includes(term),
    );
  }

  ngOnInit(): void {
    this.fetchGuests();
  }

  fetchGuests(): void {
    this.loading.set(true);
    this.error.set(null);

    this.guestService.list().subscribe({
      next: (guests) => {
        this.guests.set(guests);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o histórico de hóspedes. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  openDetail(guest: Guest): void {
    this.selectedGuest.set(guest);
  }

  closeDetail(): void {
    this.selectedGuest.set(null);
  }

  protected totalSpent(guest: Guest): number {
    return guest.stays.reduce((sum, stay) => sum + stay.totalSpent, 0);
  }

  protected lastStay(guest: Guest): Date | null {
    if (guest.stays.length === 0) return null;
    return guest.stays.reduce(
      (latest, stay) => (stay.checkOut > latest ? stay.checkOut : latest),
      guest.stays[0].checkOut,
    );
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}
