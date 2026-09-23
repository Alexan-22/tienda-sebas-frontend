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
  ProductoTalla
} from '../models/producto-talla';


@Injectable({
  providedIn: 'root'
})
export class ProductoTallaService {

  private readonly apiUrl =
    'http://localhost:8080/api/producto-tallas';


  constructor(
    private http: HttpClient
  ) {}


  listarPorProducto(
    idProducto: number
  ): Observable<ProductoTalla[]> {

    return this.http.get<ProductoTalla[]>(
      `${this.apiUrl}/producto/${idProducto}`
    );
  }
}