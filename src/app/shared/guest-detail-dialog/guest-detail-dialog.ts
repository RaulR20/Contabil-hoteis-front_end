import { Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Guest } from '../../core/services/guest.service';
import { Modal } from '../modal/modal';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-guest-detail-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, Modal, Icon],
  templateUrl: './guest-detail-dialog.html',
  styleUrl: './guest-detail-dialog.scss',
})
export class GuestDetailDialog {
  readonly guest = input.required<Guest>();
  readonly closed = output<void>();

  protected readonly totalSpent = computed(() =>
    this.guest().stays.reduce((sum, stay) => sum + stay.totalSpent, 0),
  );

  protected readonly totalNights = computed(() =>
    this.guest().stays.reduce((sum, stay) => sum + this.nights(stay.checkIn, stay.checkOut), 0),
  );

  protected readonly sortedStays = computed(() =>
    [...this.guest().stays].sort((a, b) => b.checkOut.getTime() - a.checkOut.getTime()),
  );

  close(): void {
    this.closed.emit();
  }

  protected nights(checkIn: Date, checkOut: Date): number {
    return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
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
