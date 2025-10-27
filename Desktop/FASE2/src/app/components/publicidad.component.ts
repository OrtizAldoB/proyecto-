import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicidadService } from '../services/publicidad.service';
import { Publicidad } from '../models/publicidad.model';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-publicidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publicidad.component.html',
  styleUrls: ['./publicidad.component.css']
})
export class PublicidadComponent {
  title = '';
  content = '';
  active = true;

  eventId: string | null = null;

  constructor(public publicidadService: PublicidadService, private route: ActivatedRoute, private eventService: EventService) {
    const eid = this.route.snapshot.queryParamMap.get('eventId');
    if (eid) {
      this.eventId = eid;
      const ev = this.eventService.getEvents().find(e => e.id === eid);
      if (ev) {
        this.title = `Publicidad para: ${ev.name}`;
      }
    }
  }

  add() {
    if (!this.title || !this.content) return;
    this.publicidadService.add({ title: this.title, content: this.content, active: this.active });
    this.title = '';
    this.content = '';
    this.active = true;
  }

  toggle(ad: Publicidad) {
    this.publicidadService.update(ad.id, { active: !ad.active });
  }

  remove(id: string) {
    this.publicidadService.delete(id);
  }
}
