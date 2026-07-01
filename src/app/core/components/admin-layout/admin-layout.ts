import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  public authService = inject(Auth);

  // Signal del usuario actual
  public currentUser = this.authService.currentUser;

  // ⚡ Módulos del menú ordenados de forma reactiva y estricta (1 al 7) con computed
  public menuItems = computed(() => {
    // Si userModules es un Signal lo ejecutamos como función (), si es un array común quitamos los paréntesis
    const modules = typeof this.authService.userModules === 'function' 
      ? this.authService.userModules() 
      : (this.authService.userModules as any[]);
      
    const rawModules = modules || [];

    // Diccionario con las posiciones exactas deseadas
    const ordenFijo: { [key: string]: number } = {
      'inicio': 1,
      'home': 1,
      'roles': 2,
      'users': 3,
      'usuarios': 3,
      'fichas': 4,
      'dispositivos': 5,
      'devices': 5,
      'vehiculos': 6,
      'vehículos': 6,
      'vehicles': 6,
      'accesos': 7
    };

    // Retorna una copia ordenada sin alterar el estado original
    return [...rawModules].sort((a, b) => {
      const nameA = (a.name || a || '').toLowerCase().trim();
      const nameB = (b.name || b || '').toLowerCase().trim();

      const pesoA = ordenFijo[nameA] ?? 99;
      const pesoB = ordenFijo[nameB] ?? 99;

      return pesoA - pesoB;
    });
  });

  // Breakpoint signal (Solución definitiva al NG0100 y parpadeos en layout)
  public isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay()
    ),
    { initialValue: this.breakpointObserver.isMatched(Breakpoints.Handset) }
  );
  
  // El título se evalúa una sola vez al instanciar el componente para evitar parpadeos al cerrar sesión
  public panelTitle = this.authService.isVigilante() ? 'Panel Vigilante' : 'Panel Administrativo';

  /**
   * Mapea el nombre del módulo con un ícono de Material Design.
   * Basado en los módulos reales registrados en el backend.
   */
  getIcon(moduleName: string): string {
    const name = moduleName.toLowerCase().trim();
    const iconMap: { [key: string]: string } = {
      'inicio':        'home',
      'home':          'home',
      'usuarios':      'manage_accounts',
      'users':         'manage_accounts',
      'roles':         'admin_panel_settings',
      'dispositivos':  'devices',
      'devices':       'devices',
      'vehículos':     'directions_car',
      'vehiculos':     'directions_car',
      'vehicles':      'directions_car',
      'fichas':        'badge',
      'módulos':       'view_module',
      'modules':       'view_module',
      'configuración': 'settings',
      'settings':      'settings',
      'vigilante':     'security',
      'accesos':       'fingerprint',
    };
    return iconMap[name] ?? 'extension';
  }

  // Cierre de sesión limpio con redirección directa al flujo de autenticación
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']).then(() => {
      window.location.reload();
    });
  }
}