import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AddressService } from '../../../core/services/address.service';
import { Address } from '../../../core/models/address.model';
import { NotificationService } from '../../../core/services/notification.service';

/** Address page: all added addresses + Add new address CTA. */
@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './address-list.component.html',
  styleUrl: './address-list.component.scss',
})
export class AddressListComponent implements OnInit {
  readonly addresses = signal<Address[]>([]);
  readonly isLoading = signal(true);
  readonly deletingId = signal<number | null>(null);

  constructor(
    private readonly addressService: AddressService,
    private readonly notifications: NotificationService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.isLoading.set(true);
    this.addressService.list().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  deleteAddress(address: Address): void {
    if (!confirm(`Delete the address "${address.label || address.line1}"?`)) return;

    this.deletingId.set(address.id);
    this.addressService.delete(address.id).subscribe({
      next: () => {
        this.addresses.update((list) => list.filter((a) => a.id !== address.id));
        this.deletingId.set(null);
        this.notifications.showSuccess('Address deleted.');
      },
      error: () => this.deletingId.set(null),
    });
  }
}