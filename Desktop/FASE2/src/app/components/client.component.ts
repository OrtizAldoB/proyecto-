import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { NotificationService } from '../services/notification.service';
import { TicketService } from '../services/ticket.service';
import { Event } from '../models/event.model';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent {
  selectedEvent = signal<Event | null>(null);

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private notificationService: NotificationService,
    private router: Router,
    private ticketService: TicketService
  ) {}

  goToPublicidad(event: Event): void {
    this.router.navigate(['/publicidad'], { 
      queryParams: { 
        eventId: event.id,
        eventName: event.name
      } 
    });
  }

  notifications = this.notificationService.notifications;

  ngOnInit(): void {
    // load persisted notifications when client loads
    this.notificationService.loadFromStorage && this.notificationService.loadFromStorage();
  }

  events = this.eventService.events;

  getTicketsVendidos(eventId: string): number {
    return this.ticketService.list().filter(t => t.eventId === eventId && !t.refunded).length;
  }

  generateQR(event: Event): void {
    if (this.getTicketsVendidos(event.id) >= event.capacity) {
      this.notificationService.notify('Este evento ya ha alcanzado su capacidad máxima');
      return;
    }
    this.selectedEvent.set(event);
  }

  async confirmarVenta(): Promise<void> {
    const event = this.selectedEvent();
    if (!event) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    // Crear el ticket
    const ticket = await this.ticketService.buy({
      eventId: event.id,
      buyerName: currentUser.username
    });

    // Generar el QR
    const canvas = document.createElement('canvas');
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      eventId: event.id,
      eventName: event.name,
      date: event.date,
      buyerName: ticket.buyerName
    });

    try {
      await QRCode.toCanvas(canvas, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Descargar el QR automáticamente
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `entrada-${event.name}-${ticket.id}.png`;
      link.href = url;
      link.click();

      // Notificar al usuario
      this.notificationService.notify('¡Venta confirmada! Se ha descargado tu entrada con código QR.');
      
      // Cerrar el modal (asumiendo que estás usando MaterializeCSS)
      const modalElement = document.getElementById('qrModal');
      if (modalElement && (window as any).M) {
        const modal = (window as any).M.Modal.getInstance(modalElement);
        if (modal) modal.close();
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.notificationService.notify('Error al generar el código QR');
    }
  }

  closeModal(): void {
    this.selectedEvent.set(null);
  }

  logout(): void {
    this.authService.logout();
  }
}
