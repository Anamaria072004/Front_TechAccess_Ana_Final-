import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../models/roles.model';
import { Modulo } from '@features/modulo/models/modulo.model';
import { API_URL } from '../../../app.config.token';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrlBase: string 
  ) {}

  // Definimos las rutas dinámicas
  private get rolesUrl() { return `${this.apiUrlBase}/roles`; }
  private get modulesUrl() { return `${this.apiUrlBase}/modules`; }

  getAll(): Observable<any> {
    return this.http.get<any>(this.rolesUrl);
  }

  getOne(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.rolesUrl}/${id}`);
  }

  create(role: Omit<Role, 'id'>): Observable<Role> {
    return this.http.post<Role>(this.rolesUrl, role);
  }

  update(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.patch<Role>(`${this.rolesUrl}/${id}`, role);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${id}`);
  }

  getModules(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(this.modulesUrl);
  }
}