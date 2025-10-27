import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { AdminComponent } from './components/admin.component';
import { AgentComponent } from './components/agent.component';
import { ClientComponent } from './components/client.component';
import { authGuard } from './guards/auth.guard';
import { PublicidadComponent } from './components/publicidad.component';
import { VentaBoletosComponent } from './components/venta-boletos.component';
import { ControlAsistenciaComponent } from './components/control-asistencia.component';
import { ControlDevolucionComponent } from './components/control-devolucion.component';

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
  {
    path: 'publicidad',
    component: PublicidadComponent,
    canActivate: [authGuard],
    // permitir admin, agent y client para acceder a la gestión/solicitud de publicidad
    data: { role: ['admin', 'agent', 'client'] }
  },
  {
    path: 'venta-boletos',
    component: VentaBoletosComponent,
    canActivate: [authGuard],
    // clientes y agentes pueden vender/registrar boletos
    data: { role: ['client', 'agent'] }
  },
  {
    path: 'asistencia',
    component: ControlAsistenciaComponent,
    canActivate: [authGuard],
    // tanto agente como admin pueden controlar asistencia
    data: { role: ['agent', 'admin'] }
  },
  {
    path: 'devolucion',
    component: ControlDevolucionComponent,
    canActivate: [authGuard],
    // agente y admin pueden gestionar devoluciones
    data: { role: ['admin', 'agent'] }
  },
  { path: '**', redirectTo: '/login' }
];
