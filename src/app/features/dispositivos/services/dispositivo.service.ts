import { Injectable, Inject } from '@angular/core'; // Importa Inject
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dispositivo } from '../models/dispositivos.model';
import { API_URL } from '../../../app.config.token';

@Injectable({
  providedIn: 'root'
})
export class DispositivoService {
  
  // Inyectamos el token en el constructor
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrlBase: string 
  ) {}

  // Definimos la URL base para este servicio
  private get baseUrl() { return `${this.apiUrlBase}/dispositivos`; }

  getAll(page: number = 1, limit: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(this.baseUrl, { params });
  }

  getOne(id: number): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${this.baseUrl}/${id}`);
  }

  getByUser(usuarioId: number): Observable<Dispositivo[]> {
    return this.http.get<Dispositivo[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  create(data: Dispositivo): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(this.baseUrl, data);
  }

  update(id: number, dispositivo: Partial<Dispositivo>): Observable<Dispositivo> {
    return this.http.patch<Dispositivo>(`${this.baseUrl}/${id}`, dispositivo);
  }

  delete(id: number, soft: boolean = true): Observable<any> {
    const params = new HttpParams().set('soft', soft.toString());
    return this.http.delete(`${this.baseUrl}/${id}`, { params });
  }
}