import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Acceso, CreateAccesoDto } from '../models/reg-acceso.model';
import { Usuario } from '@features/users/models/users.model';
import { API_URL } from '../../../app.config.token';

@Injectable({
  providedIn: 'root'
})
export class RegAccesoService {
  
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrlBase: string // Inyectamos la base URL
  ) {}

  // Definimos las rutas dinámicas basadas en la base inyectada
  private get accesoUrl() { return `${this.apiUrlBase}/reg-acceso`; }
  private get usersUrl() { return `${this.apiUrlBase}/users`; }

  // POST: Crear el acceso
  crearAcceso(dto: CreateAccesoDto): Observable<Acceso> {
    return this.http.post<Acceso>(this.accesoUrl, dto);
  }

  // GET: Historial de accesos
  obtenerAccesos(): Observable<Acceso[]> {
    return this.http.get<Acceso[]>(this.accesoUrl);
  }

  // Buscar usuario por documento
  buscarUsuarioPorDocumento(docNumber: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.usersUrl}/documento/${docNumber}`);
  }

  eliminarAcceso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.accesoUrl}/${id}`);
  }
}