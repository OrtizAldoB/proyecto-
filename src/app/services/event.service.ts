import { Injectable, signal } from '@angular/core';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsSignal = signal<Event[]>([]);
  events = this.eventsSignal.asReadonly();

  constructor() {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      this.eventsSignal.set(JSON.parse(savedEvents));
    }
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
