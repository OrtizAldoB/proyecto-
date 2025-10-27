import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { Event as AppEvent } from '../models/event.model';
import { Salon } from '../models/salon.model';
import { SalonService } from '../services/salon.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private eventService: EventService
    , private salonService: SalonService
  ) {}

  ngOnInit(): void {
    this.currentUserName = this.authService.currentUser()?.username || '';
  }

  // Smooth scroll to a section by element id
  scrollTo(sectionId: string): void {
    try {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      // ignore errors in non-browser contexts
    }
  }

  events = this.eventService.events;
  salons = this.salonService.salons;

  // salon form fields
  salonName = '';
  salonTables = 1;
  salonChairs = 0;
  salonTablecloths = 0;
  salonPrice = 0;
  editingSalonId: string | null = null;
  // user management
  creatingUserRole: 'agent' | 'admin' | null = null;
  newUserName = '';
  newUserPass = '';
  users = this.authService.users;

  currentUserName = '';

  agentsActive(): number {
    return this.users().filter(u => u.role === 'agent').length;
  }

  eventsThisMonth(): number {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.events().filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  }

  monthlyRevenue(): number {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.events().reduce((sum, e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        return sum + (e.salonPrice || 0);
      }
      return sum;
    }, 0);
  }

  previousMonthRevenue(): number {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = prev.getMonth();
    const year = prev.getFullYear();
    return this.events().reduce((sum, e) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        return sum + (e.salonPrice || 0);
      }
      return sum;
    }, 0);
  }

  growthPercent(): string {
    const prev = this.previousMonthRevenue();
    const cur = this.monthlyRevenue();
    if (prev === 0) {
      return prev === cur ? '0%' : '+100%';
    }
    const p = ((cur - prev) / prev) * 100;
    return (p >= 0 ? '+' : '') + Math.round(p) + '%';
  }

  // Event edit form state
  editingEventId: string | null = null;
  editEventName = '';
  editEventDate = '';
  editEventTime = '';
  editEventCapacity = 0;
  editReservationStart = '';
  editReservationEnd = '';
  editReservationPurpose = '';
  editSelectedSalonId: string | null = null;

  uniqueAgents(): number {
    const agents = new Set(this.events().map(event => event.createdBy));
    return agents.size;
  }

  upcomingEvents(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.events().filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    }).length;
  }

  onEditEvent(event: AppEvent): void {
    // populate edit form
    this.editingEventId = event.id;
    this.editEventName = event.name || '';
    this.editEventDate = event.date || '';
    this.editEventTime = event.time || '';
    this.editEventCapacity = event.capacity || 0;
    this.editReservationStart = event.reservationStartTime || '';
    this.editReservationEnd = event.reservationEndTime || '';
    this.editReservationPurpose = event.reservationPurpose || '';
    this.editSelectedSalonId = event.salonId || null;
    // scroll to edit form (optional)
    setTimeout(() => {
      const el = document.getElementById('editEventForm');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  saveEditedEvent(): void {
    if (!this.editingEventId) return;

    // snapshot salon price if salon changed or to preserve existing
    let salonPrice: number | undefined = undefined;
    if (this.editSelectedSalonId) {
      const s = this.salonService.salons().find(x => x.id === this.editSelectedSalonId);
      salonPrice = s?.price;
    }

    const changes: Partial<AppEvent> = {
      name: this.editEventName,
      date: this.editEventDate,
      time: this.editEventTime,
      capacity: this.editEventCapacity,
      reservationStartTime: this.editReservationStart || undefined,
      reservationEndTime: this.editReservationEnd || undefined,
      reservationPurpose: this.editReservationPurpose || undefined,
      salonId: this.editSelectedSalonId || undefined,
      salonPrice: salonPrice
    };

    this.eventService.updateEvent(this.editingEventId, changes as Partial<AppEvent>);
    this.cancelEditEvent();
  }

  cancelEditEvent(): void {
    this.editingEventId = null;
    this.editEventName = '';
    this.editEventDate = '';
    this.editEventTime = '';
    this.editEventCapacity = 0;
    this.editReservationStart = '';
    this.editReservationEnd = '';
    this.editReservationPurpose = '';
    this.editSelectedSalonId = null;
  }

  onDeleteEvent(eventId: string): void {
    this.eventService.deleteEvent(eventId);
  }

  onAddEvent(): void {
    // TODO: Implementar agregar evento
    console.log('Agregar nuevo evento');
  }

  addSalon(): void {
    if (!this.salonName || this.salonTables < 1) return;

    const currentUser = this.authService.currentUser();

    this.salonService.addSalon({
      name: this.salonName,
      tables: this.salonTables,
      chairsAvailable: this.salonChairs,
      tableclothsAvailable: this.salonTablecloths,
      price: this.salonPrice,
      createdBy: currentUser?.username
    });

    // reset form
    this.salonName = '';
    this.salonTables = 1;
    this.salonChairs = 0;
    this.salonTablecloths = 0;
    this.salonPrice = 0;
  }

  // Put salon data into the form for editing
  editSalon(salon: Salon): void {
    this.editingSalonId = salon.id;
    this.salonName = salon.name;
    this.salonTables = salon.tables;
    this.salonChairs = salon.chairsAvailable;
    this.salonTablecloths = salon.tableclothsAvailable;
    this.salonPrice = salon.price || 0;
    // scroll to form (optional UX)
    setTimeout(() => {
      const el = document.getElementById('salonName');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // ensure Materialize-style labels (if present) float when programmatically setting values
      const labels = [
        document.querySelector('label[for="salonName"]'),
        document.querySelector('label[for="salonTables"]'),
        document.querySelector('label[for="salonChairs"]'),
        document.querySelector('label[for="salonTablecloths"]')
      ];
      labels.forEach(l => l && l.classList.add('active'));
    }, 0);
  }

  saveSalon(): void {
    if (!this.editingSalonId) return;

    this.salonService.updateSalon(this.editingSalonId, {
      name: this.salonName,
      tables: this.salonTables,
      chairsAvailable: this.salonChairs,
      tableclothsAvailable: this.salonTablecloths
      , price: this.salonPrice
    });

    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingSalonId = null;
    this.salonName = '';
    this.salonTables = 1;
    this.salonChairs = 0;
    this.salonTablecloths = 0;
    this.salonPrice = 0;
  }

  createUser(): void {
    if (!this.creatingUserRole || !this.newUserName || !this.newUserPass) return;
    const res = this.authService.registerUser({ username: this.newUserName, password: this.newUserPass, role: this.creatingUserRole });
    if (!res.success) {
      console.error('Error creating user', res.message);
      return;
    }
    // reset
    this.newUserName = '';
    this.newUserPass = '';
    this.creatingUserRole = null;
  }

  cancelCreateUser(): void {
    this.creatingUserRole = null;
    this.newUserName = '';
    this.newUserPass = '';
  }

  deleteSalon(id: string): void {
    this.salonService.deleteSalon(id);
  }

  logout(): void {
    this.authService.logout();
  }
}
