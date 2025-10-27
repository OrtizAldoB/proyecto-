import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { AdminComponent } from './components/admin.component';
import { AgentComponent } from './components/agent.component';
import { ClientComponent } from './components/client.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'agent',
    component: AgentComponent,
    canActivate: [authGuard],
    data: { role: 'agent' }
  },
  {
    path: 'client',
    component: ClientComponent,
    canActivate: [authGuard],
    data: { role: 'client' }
  },
  { path: '**', redirectTo: '/login' }
];
