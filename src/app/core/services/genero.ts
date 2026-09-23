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
  Genero
} from '../models/producto';


@Injectable({
  providedIn: 'root'
})
export class GeneroService {

  private readonly apiUrl =
    'http://localhost:8080/api/generos';


  constructor(
    private http: HttpClient
  ) {}


  listar(): Observable<Genero[]> {

    return this.http.get<Genero[]>(
      this.apiUrl
    );
  }
}