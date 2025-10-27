import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  template: `
    <div class="side-menu">
      <h6>Acceder como</h6>
      <button class="btn-flat role-btn" (click)="goToRole('admin')">Administrador</button>
      <button class="btn-flat role-btn" (click)="goToRole('agent')">Agente</button>
      <button class="btn-flat role-btn" (click)="goToRole('client')">Cliente</button>
    </div>
  `,
  styles: [
    `
      .side-menu { padding: 12px; background:#f5f5f5; height:100vh; box-sizing: border-box; }
      .role-btn { display:block; width:100%; text-align:left; margin:6px 0; }
      h6 { margin: 0 0 8px 0; }
    `
  ]
})
export class SideMenuComponent {
  constructor(private router: Router) {}

  goToRole(role: string): void {
    this.router.navigate(['/login'], { queryParams: { role } });
  }
}
