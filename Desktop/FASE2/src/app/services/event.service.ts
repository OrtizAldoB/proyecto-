import { Injectable, signal } from '@angular/core';
import { Event } from '../models/event.model';
import { TicketService } from './ticket.service';
import { DevolucionService } from './devolucion.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsSignal = signal<Event[]>([]);
  events = this.eventsSignal.asReadonly();

  constructor(
    private ticketService: TicketService,
    private devolService: DevolucionService,
    private notifier: NotificationService
  ) {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      this.eventsSignal.set(JSON.parse(savedEvents));
    }
    // load persisted notifications
    this.notifier.loadFromStorage && this.notifier.loadFromStorage();
  }

  getById(id: string): Event | null {
    return this.events().find(e => e.id === id) || null;
  }

  /**
   * Cancela un evento. Si `refund` es true, genera devoluciones para los tickets vendidos
   * y marca los tickets como reembolsados.
   */
  cancelEvent(eventId: string, refund: boolean = false, processedBy?: string): void {
    const ev = this.events().find(e => e.id === eventId);
    if (!ev) return;

    const relatedTickets = this.ticketService.list().filter(t => t.eventId === eventId);

    if (refund) {
      relatedTickets.forEach(t => {
        const amount = t.price || 0;
        this.devolService.request({ salonId: ev.salonId || '', amount, reason: `Reembolso por cancelación del evento ${ev.name}` });
        this.ticketService.markRefunded(t.id, amount);
      });
      this.notifier.notify(`Evento "${ev.name}" cancelado. Se generaron devoluciones para ${relatedTickets.length} boletos.`);
    } else {
      this.notifier.notify(`Evento "${ev.name}" cancelado. No se realizaron devoluciones.`);
    }

    // finalmente eliminar el evento
    this.deleteEvent(eventId);
  }

  addEvent(event: Omit<Event, 'id'>): void {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString()
    };
    const currentEvents = this.eventsSignal();
    this.eventsSignal.set([...currentEvents, newEvent]);
    this.saveToLocalStorage();
  }

  updateEvent(eventId: string, changes: Partial<Event>): void {
    const currentEvents = this.eventsSignal();
    const updatedEvents = currentEvents.map(ev => {
      if (ev.id !== eventId) return ev;
      return { ...ev, ...changes } as Event;
    });
    this.eventsSignal.set(updatedEvents);
    this.saveToLocalStorage();
  }

  getEvents(): Event[] {
    return this.events();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('events', JSON.stringify(this.events()));
  }

  deleteEvent(eventId: string): void {
    const currentEvents = this.eventsSignal();
    const updatedEvents = currentEvents.filter(event => event.id !== eventId);
    this.eventsSignal.set(updatedEvents);
    this.saveToLocalStorage();
  }
}
