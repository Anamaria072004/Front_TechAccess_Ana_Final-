import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ficha } from '../models/ficha.model'; 
import { API_URL } from '../../../app.config.token';

@Injectable({
  providedIn: 'root'
})
export class FichaService {
  
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrlBase: string
  ) {}

  // Definimos la base para este servicio
  private get baseUrl() { return `${this.apiUrlBase}/ficha`; }

  getAll(page: number = 1, limit: number = 100): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('includeInactivas', 'false');
    return this.http.get<any>(this.baseUrl, { params });
  }

  getOne(id: number): Observable<Ficha> {
    return this.http.get<Ficha>(`${this.baseUrl}/${id}`);
  }

  create(ficha: Ficha): Observable<Ficha> {
    return this.http.post<Ficha>(this.baseUrl, ficha);
  }

  update(id: number, ficha: Ficha): Observable<Ficha> {
    return this.http.patch<Ficha>(`${this.baseUrl}/${id}`, ficha);
  }

  delete(id: number, soft: boolean = false): Observable<any> {
    const params = new HttpParams().set('soft', soft.toString());
    return this.http.delete(`${this.baseUrl}/${id}`, { params });
  }

  getAprendices(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/aprendices`);
  }
}