import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PaymentService } from '../../../core/services/payment.service';
import { CreditCard } from '../../../core/models/payment.model';
import { NotificationService } from '../../../core/services/notification.service';

/** Credit cards page: saved card tiles with delete/edit, active/expired status, Add new card CTA. */
@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './credit-cards.component.html',
  styleUrl: './credit-cards.component.scss',
})
export class CreditCardsComponent implements OnInit {
  readonly cards = signal<CreditCard[]>([]);
  readonly isLoading = signal(true);
  readonly deletingId = signal<number | null>(null);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.isLoading.set(true);
    this.paymentService.listCreditCards().subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  deleteCard(card: CreditCard): void {
    if (!confirm(`Delete the card ending in ${card.card_number_masked.slice(-4)}?`)) return;

    this.deletingId.set(card.id);
    this.paymentService.deleteCreditCard(card.id).subscribe({
      next: () => {
        this.cards.update((list) => list.filter((c) => c.id !== card.id));
        this.deletingId.set(null);
        this.notifications.showSuccess('Card deleted.');
      },
      error: () => this.deletingId.set(null),
    });
  }
}