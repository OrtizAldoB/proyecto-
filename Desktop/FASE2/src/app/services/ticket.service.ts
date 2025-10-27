import { Injectable, signal } from '@angular/core';
import { Ticket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private ticketsSignal = signal<Ticket[]>([]);
  tickets = this.ticketsSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('tickets');
    if (saved) this.ticketsSignal.set(JSON.parse(saved));
  }

  buy(ticket: Omit<Ticket, 'id' | 'purchasedAt' | 'used'>): Ticket {
    const newT: Ticket = {
      ...ticket,
      id: Date.now().toString(),
      purchasedAt: new Date().toISOString(),
      used: false
    };
    this.ticketsSignal.set([...this.tickets(), newT]);
    this.save();
    return newT;
  }

  markRefunded(id: string, amount: number): void {
    const updated = this.tickets().map(t => t.id === id ? { ...t, refunded: true, refundedAmount: amount } : t);
    this.ticketsSignal.set(updated);
    this.save();
  }

  list(): Ticket[] {
    return this.tickets();
  }

  markUsed(id: string): void {
    const updated = this.tickets().map(t => t.id === id ? { ...t, used: true } : t);
    this.ticketsSignal.set(updated);
    this.save();
  }

  private save() {
    localStorage.setItem('tickets', JSON.stringify(this.tickets()));
  }
}
