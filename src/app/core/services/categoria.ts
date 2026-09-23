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
  Categoria
} from '../models/producto';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private readonly apiUrl =
    'http://localhost:8080/api/categorias';


  constructor(
    private http: HttpClient
  ) {}


  listar(): Observable<Categoria[]> {

    return this.http.get<Categoria[]>(
      this.apiUrl
    );
  }
}