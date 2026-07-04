import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}

/**
 * Lightweight global toast/alert bus. app.component.html renders whatever is
 * in `messages()`. Kept dependency-free (no ngx-toastr etc.) since this is
 * a small, easily-swappable piece — feel free to replace with a UI library
 * in a later phase without touching every feature that calls showError/showSuccess.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 1;
  private readonly messagesSig = signal<ToastMessage[]>([]);
  readonly messages = this.messagesSig.asReadonly();

  showError(text: string): void {
    this.push('error', text);
  }

  showSuccess(text: string): void {
    this.push('success', text);
  }

  dismiss(id: number): void {
    this.messagesSig.update((list) => list.filter((m) => m.id !== id));
  }

  private push(type: ToastMessage['type'], text: string): void {
    const id = this.nextId++;
    this.messagesSig.update((list) => [...list, { id, type, text }]);
    setTimeout(() => this.dismiss(id), 4500);
  }
}
