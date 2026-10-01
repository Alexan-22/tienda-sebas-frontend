import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientePresencialRequest, ClientePresencialResponse } from '../models/cliente-presencial';

@Injectable({
  providedIn: 'root'
})
export class ClientePresencialService {
  private readonly apiUrl = 'http://localhost:8080/api/clientes-presenciales/admin';

  constructor(
    private http: HttpClient
  ) {}

  // =========================================================
  // LISTAR CLIENTES PRESENCIALES ACTIVOS
  // =========================================================
  listar(): Observable<ClientePresencialResponse[]> {
    return this.http.get<ClientePresencialResponse[]>(this.apiUrl);
  }

  // =========================================================
  // OBTENER CLIENTE PRESENCIAL
  // =========================================================
  obtenerPorId(idClientePresencial: number): Observable<ClientePresencialResponse> {
    return this.http.get<ClientePresencialResponse>(
      `${this.apiUrl}/${idClientePresencial}`
    );
  }

  // =========================================================
  // REGISTRAR CLIENTE PRESENCIAL
  // =========================================================
  registrar(request: ClientePresencialRequest): Observable<ClientePresencialResponse> {
    return this.http.post<ClientePresencialResponse>(
      this.apiUrl,
      request
    );
  }
}