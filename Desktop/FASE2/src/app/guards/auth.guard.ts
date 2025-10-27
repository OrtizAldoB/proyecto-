import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * authGuard ahora admite `data.role` como string (único) o array de roles.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const roleData = route.data['role'];
  if (roleData) {
    if (Array.isArray(roleData)) {
      // array of roles
      if (!authService.hasAnyRole(roleData as UserRole[])) {
        router.navigate(['/login']);
        return false;
      }
    } else {
      // single role
      if (!authService.hasRole(roleData as UserRole)) {
        router.navigate(['/login']);
        return false;
      }
    }
  }

  return true;
};
