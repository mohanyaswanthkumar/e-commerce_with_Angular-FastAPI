import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/**
 * Global dynamic header: logo + products-link are common to everyone.
 * Unauth -> shows Login link.
 * Auth   -> shows "Hi, <first name>" dropdown (My orders / My profile /
 *           Payment info / Addresses / Logout), cart icon, wishlist icon.
 * A real cart-count badge will be wired up once cart.service.ts exists (Phase 1);
 * for now the icon just links to /cart.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly isDropdownOpen = signal(false);
  readonly searchQuery = signal('');

  constructor(
    readonly auth: AuthService,
    private readonly router: Router,
    private readonly elementRef: ElementRef<HTMLElement>,
  ) {}

  toggleDropdown(): void {
    this.isDropdownOpen.update((open) => !open);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  onSearchSubmit(): void {
    const query = this.searchQuery().trim();
    if (!query) return;
    // Dynamic search bar on the header -> PLP, matching product_router.get_plp(search=...)
    this.router.navigate(['/products'], { queryParams: { search: query } });
  }

  logout(): void {
    this.closeDropdown();
    this.auth.logout();
    this.router.navigate(['/']);
  }

  /** Closes the dropdown when clicking anywhere outside the header. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }
}
