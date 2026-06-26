import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Permite el área admin a 'editor' y 'admin'; el resto va al portal. */
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isStaff() ? true : router.createUrlTree(['/constitucion/estructura']);
};
