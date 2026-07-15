import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActividadModalComponent } from './components/actividad-modal/actividad-modal';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioComponent implements OnInit {
  userName = 'Usuario';
  currentDate = new Date();
  
  // URL de producción en Render 
  private apiUrl = 'https://back-techaccess-ana-final.onrender.com/api'; 
  
  
  private dialog = inject(MatDialog);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  
  totalUsuarios = 0;
  totalVehiculos = 0;
  totalFichas = 0;
  totalDispositivos = 0;

  recentActivity: any[] = [];

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userName = user.name || 'Usuario';
      } catch (e) {
        console.error('Error al parsear el usuario', e);
      }
    }

    // Consultas de KPIs usando la URL de Render
    this.http.get<any>(`${this.apiUrl}/users`).subscribe({
      next: (res) => { this.totalUsuarios = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin usuarios')
    });

    this.http.get<any>(`${this.apiUrl}/vehiculos`).subscribe({
      next: (res) => { this.totalVehiculos = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin vehículos')
    });

    this.http.get<any>(`${this.apiUrl}/ficha`).subscribe({
      next: (res) => { this.totalFichas = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin fichas')
    });

    this.http.get<any>(`${this.apiUrl}/dispositivos`).subscribe({
      next: (res) => { this.totalDispositivos = res.total !== undefined ? res.total : (res.data || res).length; this.cdr.detectChanges(); },
      error: () => console.log('Sin dispositivos')
    });

    // EndPoint del Feed Principal usando la URL de Render
    this.http.get<any>(`${this.apiUrl}/reg-acceso`).subscribe({
      next: (res) => { 
        const registros = res.data || res;
        
        if (registros.length > 0) {
          const registrosMapeados = registros.map((acc: any) => {
            const userStr = acc.usuario ? `${acc.usuario.name} ${acc.usuario.lastName}` : `Usuario ID: ${acc.usuarioId || acc.id}`;
            const dateObj = new Date(acc.horaFecha);
            
            let timeStr = 'Fecha desconocida';
            if (!isNaN(dateObj.getTime())) {
              const time = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
              const date = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
              timeStr = `${time} - ${date}`;
            }

            const esIngreso = !!acc.accion;
            return {
              dateVal: dateObj.getTime() || 0,
              type: esIngreso ? 'Ingreso' : 'Salida',
              message: `${userStr} ha ${esIngreso ? 'ingresado al' : 'salido del'} centro.`,
              time: timeStr,
              icon: esIngreso ? 'login' : 'logout',
              color: esIngreso ? 'blue' : 'orange'
            };
          });

          // Ordenar de más nuevo a más viejo
          registrosMapeados.sort((a: any, b: any) => b.dateVal - a.dateVal);

          // Cortar los 4 más recientes
          this.recentActivity = registrosMapeados.slice(0, 4);
        }
        
        this.cdr.detectChanges(); 
      },
      error: () => console.log('Sin ingresos')
    });
  }

  abrirModalActividad(): void {
    const dialogRef = this.dialog.open(ActividadModalComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false
    });

    // Actualiza el feed del Dashboard cuando cierres el modal
    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }
}