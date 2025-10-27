import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalonService } from '../services/salon.service';
import { DevolucionService } from '../services/devolucion.service';

@Component({
  selector: 'app-control-devolucion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-devolucion.component.html',
  styleUrls: ['./control-devolucion.component.css']
})
export class ControlDevolucionComponent {
  selectedSalon = '';
  amount = 0;
  reason = '';

  constructor(public salonService: SalonService, public devolucionService: DevolucionService) {}

  request() {
    if (!this.selectedSalon || !this.amount) return;
    this.devolucionService.request({ salonId: this.selectedSalon, amount: this.amount, reason: this.reason });
    this.selectedSalon = '';
    this.amount = 0;
    this.reason = '';
  }
}
