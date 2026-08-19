import { Component, HostListener, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [Icon],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
