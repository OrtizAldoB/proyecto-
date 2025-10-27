import { Injectable, signal } from '@angular/core';
import { Publicidad } from '../models/publicidad.model';

@Injectable({ providedIn: 'root' })
export class PublicidadService {
  private adsSignal = signal<Publicidad[]>([]);
  ads = this.adsSignal.asReadonly();

  constructor() {
    const saved = localStorage.getItem('publicidad');
    if (saved) this.adsSignal.set(JSON.parse(saved));
  }

  list(): Publicidad[] {
    return this.ads();
  }

  add(ad: Omit<Publicidad, 'id' | 'createdAt'>): void {
    const newAd: Publicidad = {
      ...ad,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.adsSignal.set([...this.ads(), newAd]);
    this.save();
  }

  update(id: string, patch: Partial<Publicidad>): void {
    const updated = this.ads().map(a => a.id === id ? { ...a, ...patch } : a);
    this.adsSignal.set(updated);
    this.save();
  }

  delete(id: string): void {
    this.adsSignal.set(this.ads().filter(a => a.id !== id));
    this.save();
  }

  private save() {
    localStorage.setItem('publicidad', JSON.stringify(this.ads()));
  }
}
