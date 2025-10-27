import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
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
    private eventService: EventService
  ) {}

  events = this.eventService.events;

  async generateQR(event: Event): Promise<void> {
    this.selectedEvent.set(event);

    setTimeout(async () => {
      const canvas = document.getElementById('qrCanvas') as HTMLCanvasElement;
      if (canvas) {
        const qrData = JSON.stringify({
          eventId: event.id,
          eventName: event.name,
          date: event.date,
          location: event.location,
          ticket: `TICKET-${event.id}-${Date.now()}`
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
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    }, 100);
  }

  downloadQR(): void {
    const canvas = document.getElementById('qrCanvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `entrada-${this.selectedEvent()?.name}.png`;
      link.href = url;
      link.click();
    }
  }

  closeModal(): void {
    this.selectedEvent.set(null);
  }

  logout(): void {
    this.authService.logout();
  }
}
