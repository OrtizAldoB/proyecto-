import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from './components/side-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SideMenuComponent, RouterOutlet],
  template: `
    <div style="display:flex;">
      <app-side-menu></app-side-menu>
      <div style="flex:1; padding: 12px;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'event-management';
}
