import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehiculo } from '../models/vehiculo.model';
import { API_URL } from '../../../app.config.token';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrlBase: string 
  ) {}

  // Definimos la ruta dinámica
  private get baseUrl() { return `${this.apiUrlBase}/vehiculos`; }

  getAll(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  getOne(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.baseUrl}/${id}`);
  }

  create(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.baseUrl, vehiculo);
  }

  update(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.baseUrl}/${id}`, vehiculo);
  }

  delete(id: number): Observable<Vehiculo> {
    return this.http.delete<Vehiculo>(`${this.baseUrl}/${id}`);
  }
}