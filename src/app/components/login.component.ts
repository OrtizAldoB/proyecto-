import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserRole } from '../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = signal<string>('');
  intendedRole: UserRole | null = null;
  showRegister = false;
  registerUsername = '';
  registerPassword = '';

  constructor(private authService: AuthService, private route: ActivatedRoute) {
    // read role from query params when component is created
    const role = this.route.snapshot.queryParamMap.get('role');
    if (role === 'admin' || role === 'agent' || role === 'client') {
      this.intendedRole = role as UserRole;
    }
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }

  const success = this.authService.login(this.username, this.password, this.intendedRole || undefined);

    if (!success) {
      this.errorMessage.set('Credenciales incorrectas');
    }
  }

  onRegister(): void {
    if (!this.registerUsername || !this.registerPassword) {
      this.errorMessage.set('Por favor completa todos los campos de registro');
      return;
    }
    const result = this.authService.registerUser({ username: this.registerUsername, password: this.registerPassword, role: 'client' });
    if (!result.success) {
      this.errorMessage.set(result.message || 'No se pudo registrar');
      return;
    }
    // auto-login the new client
    this.authService.login(this.registerUsername, this.registerPassword, 'client');
  }
}
