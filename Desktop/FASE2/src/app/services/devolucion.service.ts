import { Injectable, signal } from '@angular/core';
import { Devolucion, DevolucionStatus } from '../models/devolucion.model';

@Injectable({ providedIn: 'root' })
export class DevolucionService {
  private devsSignal = signal<Devolucion[]>([]);
  devoluciones = this.devsSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('devoluciones');
    if (saved) this.devsSignal.set(JSON.parse(saved));
  }

  request(dev: Omit<Devolucion, 'id' | 'requestedAt' | 'status'>): Devolucion {
    const newD: Devolucion = {
      ...dev,
      id: Date.now().toString(),
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };
    this.devsSignal.set([...this.devoluciones(), newD]);
    this.save();
    return newD;
  }

  list(): Devolucion[] {
    return this.devoluciones();
  }

  updateStatus(id: string, status: DevolucionStatus, processedBy?: string): void {
    const updated = this.devoluciones().map(d => d.id === id ? { ...d, status, processedBy } : d);
    this.devsSignal.set(updated);
    this.save();
  }

  private save() {
    localStorage.setItem('devoluciones', JSON.stringify(this.devoluciones()));
  }
}
