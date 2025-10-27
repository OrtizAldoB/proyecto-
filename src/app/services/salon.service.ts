import { Injectable, signal } from '@angular/core';
import { Salon } from '../models/salon.model';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private salonsSignal = signal<Salon[]>([]);
  salons = this.salonsSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('salons');
    if (saved) {
      this.salonsSignal.set(JSON.parse(saved));
    } else {
      const demo: Salon[] = [
        { id: 's1', name: 'Salón Principal', tables: 10, chairsAvailable: 100, tableclothsAvailable: 10, price: 500 },
        { id: 's2', name: 'Salón Secundario', tables: 5, chairsAvailable: 40, tableclothsAvailable: 5, price: 250 }
      ];
      this.salonsSignal.set(demo);
      this.save();
    }
  }

  addSalon(salon: Omit<Salon, 'id'>): void {
    const newSalon: Salon = {
      ...salon,
      id: Date.now().toString()
    };
    const current = this.salonsSignal();
    this.salonsSignal.set([...current, newSalon]);
    this.save();
  }

  updateSalon(id: string, patch: Partial<Omit<Salon, 'id'>>): void {
    const current = this.salonsSignal();
    const updated = current.map(s => s.id === id ? { ...s, ...patch } : s);
    this.salonsSignal.set(updated);
    this.save();
  }

  deleteSalon(id: string): void {
    const current = this.salonsSignal();
    const updated = current.filter(s => s.id !== id);
    this.salonsSignal.set(updated);
    this.save();
  }

  private save(): void {
    localStorage.setItem('salons', JSON.stringify(this.salonsSignal()));
  }
}
