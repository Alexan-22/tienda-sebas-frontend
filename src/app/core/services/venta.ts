import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  CompraRequest,
  CompraResponse
} from '../models/venta';

import {
  Venta,
  DetalleVenta
} from '../models/venta-detalle';


@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private readonly apiUrl =
    'http://localhost:8080/api/ventas';


  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // REALIZAR COMPRA
  // =========================================================

  comprar(
    request: CompraRequest
  ): Observable<CompraResponse> {

    return this.http.post<CompraResponse>(
      this.apiUrl,
      request
    );

  }


  // =========================================================
  // COMPRAS DEL CLIENTE LOGUEADO
  // =========================================================

  misCompras(): Observable<Venta[]> {

    return this.http.get<Venta[]>(
      `${this.apiUrl}/mis-compras`
    );

  }


  // =========================================================
  // ADMIN - LISTAR TODAS LAS VENTAS
  // =========================================================

  listarTodas(): Observable<Venta[]> {

    return this.http.get<Venta[]>(
      `${this.apiUrl}/admin`
    );

  }


  // =========================================================
  // DETALLE DE UNA VENTA
  // =========================================================

  detalleVenta(
    idVenta: number
  ): Observable<DetalleVenta[]> {

    return this.http.get<DetalleVenta[]>(
      `${this.apiUrl}/${idVenta}/detalle`
    );

  }

}