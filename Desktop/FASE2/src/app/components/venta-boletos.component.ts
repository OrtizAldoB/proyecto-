import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../services/event.service';
import { TicketService } from '../services/ticket.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-venta-boletos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta-boletos.component.html',
  styleUrls: ['./venta-boletos.component.css']
})
export class VentaBoletosComponent {
  selectedEventId = '';
  buyerName = '';

  constructor(
    public eventService: EventService,
    private ticketService: TicketService,
    public authService: AuthService,
    private router: Router
  ) {}

  buy() {
    if (!this.selectedEventId || !this.buyerName) return;
    this.ticketService.buy({ eventId: this.selectedEventId, buyerName: this.buyerName });
    this.buyerName = '';
  }

  goToAsistencia() {
    if (!this.selectedEventId) return;
    // navegar a la ruta de asistencia pasando el eventId en query params
    this.router.navigate(['/asistencia'], { queryParams: { eventId: this.selectedEventId } });
  }

  goToPublicidad() {
    if (!this.selectedEventId) return;
    this.router.navigate(['/publicidad'], { queryParams: { eventId: this.selectedEventId } });
  }
}
