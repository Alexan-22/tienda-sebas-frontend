import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  Producto
} from '../models/producto';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly apiUrl =
    'http://localhost:8080/api/productos';


  constructor(
    private http: HttpClient
  ) {}


  listar(): Observable<Producto[]> {

    return this.http.get<Producto[]>(
      `${this.apiUrl}/public`
    );
  }


  buscarPorId(
    id: number
  ): Observable<Producto> {

    return this.http.get<Producto>(
      `${this.apiUrl}/public/${id}`
    );
  }


  porGenero(
    idGenero: number
  ): Observable<Producto[]> {

    return this.http.get<Producto[]>(
      `${this.apiUrl}/public/genero/${idGenero}`
    );
  }


  porCategoria(
    idCategoria: number
  ): Observable<Producto[]> {

    return this.http.get<Producto[]>(
      `${this.apiUrl}/public/categoria/${idCategoria}`
    );
  }
}