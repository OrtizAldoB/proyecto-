import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../services/ticket.service';
import { AsistenciaService } from '../services/asistencia.service';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-control-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-asistencia.component.html',
  styleUrls: ['./control-asistencia.component.css']
})
export class ControlAsistenciaComponent {
  eventId: string | null = null;
  event = signal<Event | null>(null);
  manualAsistencia = signal<number>(0);

  constructor(
    public ticketService: TicketService,
    public asistenciaService: AsistenciaService,
    private eventService: EventService,
    private route: ActivatedRoute
  ) {
    const e = this.route.snapshot.queryParamMap.get('eventId');
    if (e) {
      this.eventId = e;
      const foundEvent = this.eventService.events().find(event => event.id === e);
      if (foundEvent) {
        this.event.set(foundEvent);
        // Cargar asistencia manual guardada
        const savedCount = localStorage.getItem(`manual_asistencia_${e}`);
        if (savedCount) {
          this.manualAsistencia.set(parseInt(savedCount));
        }
      }
    }
  }

  ticketsForView() {
    if (!this.eventId) return this.ticketService.list();
    return this.ticketService.list().filter(t => t.eventId === this.eventId);
  }

  marcar(ticketId: string) {
    this.asistenciaService.markPresent(ticketId);
    this.ticketService.markUsed(ticketId);
  }

  incrementarManual() {
    if (this.event() && this.manualAsistencia() < this.event()!.capacity) {
      this.manualAsistencia.set(this.manualAsistencia() + 1);
      this.guardarAsistenciaManual();
    }
  }

  decrementarManual() {
    if (this.manualAsistencia() > 0) {
      this.manualAsistencia.set(this.manualAsistencia() - 1);
      this.guardarAsistenciaManual();
    }
  }

  private guardarAsistenciaManual() {
    if (this.eventId) {
      localStorage.setItem(`manual_asistencia_${this.eventId}`, this.manualAsistencia().toString());
    }
  }
}
