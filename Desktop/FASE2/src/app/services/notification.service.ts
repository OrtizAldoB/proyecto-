import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notes = signal<string[]>([]);
  notifications = this.notes.asReadonly();

  notify(message: string) {
    this.notes.set([...(this.notes() || []), message]);
    // persist so notifications survive reloads
    localStorage.setItem('notifications', JSON.stringify(this.notes()));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('notifications');
    if (saved) this.notes.set(JSON.parse(saved));
  }

  clear() {
    this.notes.set([]);
    localStorage.removeItem('notifications');
  }
}
