import { Injectable, inject, Inject } from '@angular/core'; // 1. Importa Inject
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/users.model';
import { API_URL } from '../../../app.config.token';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);

  // 3. Inyecta el token en el constructor
  constructor(@Inject(API_URL) private apiUrlBase: string) {}

  // 4. Construye las URLs usando la variable inyectada
  private get usersUrl() { return `${this.apiUrlBase}/users`; }
  private get rolesUrl() { return `${this.apiUrlBase}/roles`; }

  getAll(): Observable<any> {
    return this.http.get<any>(this.usersUrl);
  }

  getOne(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.usersUrl}/${id}`);
  }

  create(user: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.usersUrl, user);
  }

  update(id: number, user: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.usersUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(this.rolesUrl);
  }
}