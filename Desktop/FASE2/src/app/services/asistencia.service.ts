import { Injectable, signal } from '@angular/core';
import { Ticket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private attendanceSignal = signal<Record<string, boolean>>({});
  attendance = this.attendanceSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('attendance');
    if (saved) this.attendanceSignal.set(JSON.parse(saved));
  }

  markPresent(ticketId: string): void {
    const current = { ...this.attendance() };
    current[ticketId] = true;
    this.attendanceSignal.set(current);
    localStorage.setItem('attendance', JSON.stringify(current));
  }

  isPresent(ticketId: string): boolean {
    return !!this.attendance()[ticketId];
  }
}
