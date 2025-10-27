import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole, MOCK_USERS } from '../models/user.model';
import { SalonService } from './salon.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();
  // manage users (persisted)
  private usersSignal = signal<User[]>(MOCK_USERS.slice());
  users = this.usersSignal.asReadonly();

  constructor(
    private router: Router,
    private salonService: SalonService
  ) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSignal.set(JSON.parse(savedUser));
    }
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try { this.usersSignal.set(JSON.parse(savedUsers)); } catch { /* ignore */ }
    } else {
      // seed persistence
      localStorage.setItem('users', JSON.stringify(this.usersSignal()));
    }
  }

  login(username: string, password: string, role?: UserRole): boolean {
    let user = null as User | null;
    const users = this.usersSignal();
    if (role) {
      user = users.find(u => u.username === username && u.password === password && u.role === role) || null;
    } else {
      user = users.find(u => u.username === username && u.password === password) || null;
    }

    if (user) {
      this.currentUserSignal.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.redirectToRolePage(user.role);
      return true;
    }
    return false;
  }

  registerUser(user: User): { success: boolean; message?: string } {
    const users = this.usersSignal();
    if (users.some(u => u.username === user.username)) {
      return { success: false, message: 'El nombre de usuario ya existe' };
    }
    this.usersSignal.set([...users, user]);
    localStorage.setItem('users', JSON.stringify(this.usersSignal()));
    return { success: true };
  }

  getUsers(): User[] {
    return this.usersSignal();
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  /**
   * Devuelve true si el usuario actual tiene alguno de los roles indicados.
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const cur = this.currentUser();
    if (!cur) return false;
    return roles.includes(cur.role);
  }

  private redirectToRolePage(role: UserRole): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'agent':
        this.router.navigate(['/agent']);
        break;
      case 'client':
        this.router.navigate(['/client']);
        break;
    }
  }

  /**
   * Restaura los usuarios y datos por defecto:
   * - admin/admin123
   * - agent/agent123
   * - client/client123
   */
  resetUsers(): void {
    // Restaurar usuarios por defecto
    this.usersSignal.set(MOCK_USERS.slice());
    localStorage.setItem('users', JSON.stringify(MOCK_USERS));
    
    // Cerrar sesión del usuario actual
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    
    // Limpiar todos los datos relacionados
    localStorage.clear(); // Limpia todo el localStorage
    
    // Restaurar datos por defecto
    localStorage.setItem('users', JSON.stringify(MOCK_USERS));
    this.salonService.resetSalons();
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}
