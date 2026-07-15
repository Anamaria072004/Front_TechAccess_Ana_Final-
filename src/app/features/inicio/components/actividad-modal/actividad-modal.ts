import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

interface AccesoMapeado {
  usuarioNombre: string;
  documento: string;
  tipo: 'Ingreso' | 'Salida';
  horaFecha: Date;
  timeStr: string;
  observacion: string;
}

@Component({
  selector: 'app-actividad-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './actividad-modal.html',
  styleUrls: ['./actividad-modal.scss']
})
export class ActividadModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ActividadModalComponent>);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  registros: AccesoMapeado[] = [];
  registrosFiltrados: AccesoMapeado[] = [];
  cargando = true;
  hayError = false;

  // Filtros
  filtroTexto = '';
  filtroTipo = 'Todos';
  filtroPeriodo = 'Todos';

  ngOnInit(): void {
    this.cargarRegistros();
  }

  cargarRegistros(): void {
    this.cargando = true;
    this.hayError = false;

    const safetyTimeout = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        this.hayError = true;
        this.cdr.detectChanges();
      }
    }, 10000);

    // En actividad-modal.component.ts cambia esto:
this.http.get<any>('   https://back-techaccess-ana-final.onrender.com/api/reg-acceso').subscribe({
      next: (res) => {
        clearTimeout(safetyTimeout);

        let raw: any[] = [];
        if (Array.isArray(res)) {
          raw = res;
        } else if (Array.isArray(res?.data)) {
          raw = res.data;
        } else if (Array.isArray(res?.registros)) {
          raw = res.registros;
        } else {
          raw = res?.items || Object.values(res || {}).find(v => Array.isArray(v)) || [];
        }

        this.registros = raw.map((acc: any) => {
          const userObj = acc.usuario;
          const name = userObj
            ? `${userObj.name || ''} ${userObj.lastName || ''}`.trim()
            : `Usuario ID: ${acc.usuarioId || acc.userId || acc.id || '?'}`;
          const doc = userObj?.docNumber || userObj?.documento || '-';
          const esIngreso = !!acc.accion;
          const dateObj = new Date(acc.horaFecha || acc.fecha || acc.createdAt);

          let timeFormatted = 'Fecha desconocida';
          if (!isNaN(dateObj.getTime())) {
            const time = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
            const date = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
            timeFormatted = `${time} - ${date}`;
          }

          return {
            usuarioNombre: name,
            documento: doc,
            tipo: esIngreso ? 'Ingreso' : 'Salida',
            horaFecha: dateObj,
            timeStr: timeFormatted,
            observacion: acc.observacion || ''
          };
        });

        // Ordenar del más reciente al más antiguo para la tabla
        this.registros.sort((a, b) => b.horaFecha.getTime() - a.horaFecha.getTime());

        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        clearTimeout(safetyTimeout);
        console.error('Error al cargar todos los registros:', err);
        this.cargando = false;
        this.hayError = true;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    const textoLower = this.filtroTexto.toLowerCase().trim();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    this.registrosFiltrados = this.registros.filter(reg => {
      const matchesTexto = !textoLower ||
        reg.usuarioNombre.toLowerCase().includes(textoLower) ||
        reg.documento.includes(textoLower);

      const matchesTipo = this.filtroTipo === 'Todos' ||
        (this.filtroTipo === 'Ingresos' && reg.tipo === 'Ingreso') ||
        (this.filtroTipo === 'Salidas' && reg.tipo === 'Salida');

      let matchesPeriodo = true;
      if (this.filtroPeriodo !== 'Todos') {
        const regDate = new Date(reg.horaFecha);
        regDate.setHours(0, 0, 0, 0);

        if (this.filtroPeriodo === 'Hoy') {
          matchesPeriodo = regDate.getTime() === hoy.getTime();
        } else if (this.filtroPeriodo === 'Ayer') {
          const ayer = new Date(hoy);
          ayer.setDate(ayer.getDate() - 1);
          matchesPeriodo = regDate.getTime() === ayer.getTime();
        } else if (this.filtroPeriodo === '7dias') {
          const limite = new Date(hoy);
          limite.setDate(limite.getDate() - 7);
          matchesPeriodo = regDate.getTime() >= limite.getTime();
        }
      }

      return matchesTexto && matchesTipo && matchesPeriodo;
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}