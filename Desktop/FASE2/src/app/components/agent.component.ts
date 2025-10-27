import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { SalonService } from '../services/salon.service';
import { Salon } from '../models/salon.model';
import { Event } from '../models/event.model';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.css']
})
export class AgentComponent {
  eventName = '';
  eventDate = '';
  eventTime = '';
  // Hora de inicio y fin de la reservación (puede ser distinta a la hora del evento)
  reservationStartTime = '';
  reservationEndTime = '';
  // Para qué es la reservación (propósito)
  reservationPurpose = '';
  eventCapacity = 0;
  selectedSalonId: string | '' = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private salonService: SalonService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  notifications = this.notificationService.notifications;

  salons = this.salonService.salons;
  showAddSalon = false;
  newSalonName = '';
  newSalonTables = 1;
  newSalonPrice = 0;

  isSalonAvailable(salonId: string, date: string, time: string): boolean {
    // Convert date and time strings to Date object for comparison
    const eventDateTime = new Date(`${date}T${time}`);
    
    // Get all events for this salon
    const salonEvents = this.eventService.events().filter(event => event.salonId === salonId);
    
    // Check if there's any event at the same date and time
    return !salonEvents.some(event => {
      const existingEventDateTime = new Date(`${event.date}T${event.time}`);
      // Consider events within 4 hours of each other as conflicting
      const timeDiff = Math.abs(eventDateTime.getTime() - existingEventDateTime.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff < 4;
    });
  }

  getSalonStatus(salon: Salon): { status: string; class: string } {
    if (this.eventDate && this.eventTime) {
      const isAvailable = this.isSalonAvailable(salon.id, this.eventDate, this.eventTime);
      return {
        status: isAvailable ? 'Disponible' : 'Ocupado',
        class: isAvailable ? 'green-text' : 'red-text'
      };
    }
    return { status: 'Pendiente selección de fecha/hora', class: 'grey-text' };
  }

  getSelectedSalonPrice(): number {
    if (!this.selectedSalonId) return 0;
    const salon = this.salons().find(s => s.id === this.selectedSalonId);
    return salon?.price || 0;
  }

  myEvents = () => {
    const currentUser = this.authService.currentUser();
    return this.eventService.events().filter(
      event => event.createdBy === currentUser?.username
    );
  };

  createEvent(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    // Validaciones mínimas
    if (!this.selectedSalonId) {
      this.successMessage = 'Por favor selecciona un salón para el evento';
      setTimeout(() => (this.successMessage = ''), 3000);
      return;
    }

    // Validar que se haya proporcionado inicio y fin, y que inicio < fin
    if (!this.reservationStartTime || !this.reservationEndTime || !this.reservationPurpose) {
      this.successMessage = 'Por favor indica hora de inicio, fin y el propósito de la reservación';
      setTimeout(() => (this.successMessage = ''), 3000);
      return;
    }

    // comprobar orden de horas (asumiendo formato HH:MM)
    const start = this.reservationStartTime;
    const end = this.reservationEndTime;
    if (start >= end) {
      this.successMessage = 'La hora de inicio debe ser anterior a la hora de fin';
      setTimeout(() => (this.successMessage = ''), 3000);
      return;
    }

    this.eventService.addEvent({
      name: this.eventName,
      date: this.eventDate,
      time: this.eventTime,
      reservationStartTime: this.reservationStartTime,
      reservationEndTime: this.reservationEndTime,
      reservationPurpose: this.reservationPurpose,
      capacity: this.eventCapacity,
      salonId: this.selectedSalonId,
      salonPrice: this.getSelectedSalonPrice(),
      createdBy: currentUser.username
    });

    this.successMessage = '¡Evento creado exitosamente!';
    // reset form
    this.eventName = '';
    this.eventDate = '';
    this.eventTime = '';
  this.reservationStartTime = '';
  this.reservationEndTime = '';
  this.reservationPurpose = '';
    this.eventCapacity = 0;
    this.selectedSalonId = '';

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  addSalonAsAgent(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;
    if (!this.newSalonName || this.newSalonTables < 1) return;
    this.salonService.addSalon({
      name: this.newSalonName,
      tables: this.newSalonTables,
      chairsAvailable: 0,
      tableclothsAvailable: 0,
      price: this.newSalonPrice,
      createdBy: currentUser.username
    });
    // reset
    this.newSalonName = '';
    this.newSalonTables = 1;
    this.newSalonPrice = 0;
    this.showAddSalon = false;
  }

  verAsistencia(event: Event): void {
    this.router.navigate(['/asistencia'], { 
      queryParams: { eventId: event.id }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
