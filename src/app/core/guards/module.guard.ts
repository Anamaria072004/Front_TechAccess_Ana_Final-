import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

export const moduleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const requiredModule = route.data['module'] as string | undefined;

  const showAccessDenied = (message: string) => {
    snackBar.open(message, 'Cerrar', { 
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  };

  const validateAccess = (): boolean => {
    const user = authService.currentUser();
    
    if (!user) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    const userModuleNames = authService.userModules().map(m => m.toLowerCase());

    if (!requiredModule) return true;

    const hasModule = userModuleNames.includes(requiredModule.toLowerCase());

    if (!hasModule) {
      showAccessDenied(`No tienes permiso asignado para el módulo: ${requiredModule}`);
      router.navigate(['/page-not-found']);
      return false;
    }

    return true;
  };

  // Verificamos de forma inmediata
  if (authService.isAuthenticated()) {
    return validateAccess();
  } else {
    router.navigateByUrl('/auth/login');
    return false;
  }
};