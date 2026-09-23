import {
  Injectable,
  computed,
  signal
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  RegistroRequest
} from '../models/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    'http://localhost:8080/api/auth';

  private readonly tokenKey =
    'tienda-sebas-token';


  private readonly tokenSignal =
    signal<string | null>(
      localStorage.getItem(this.tokenKey)
    );


  readonly autenticado =
    computed(() => this.tokenSignal() !== null);


  constructor(
    private http: HttpClient
  ) {}


  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      request
    ).pipe(

      tap(response => {

        localStorage.setItem(
          this.tokenKey,
          response.token
        );

        this.tokenSignal.set(
          response.token
        );

      })

    );
  }


  registrar(
    request: RegistroRequest
  ): Observable<string> {

    return this.http.post(
      `${this.apiUrl}/registro`,
      request,
      {
        responseType: 'text'
      }
    );
  }


  logout(): void {

    localStorage.removeItem(
      this.tokenKey
    );

    this.tokenSignal.set(null);
  }


  obtenerToken(): string | null {

    return this.tokenSignal();
  }


  obtenerCorreo(): string | null {

    const payload =
      this.obtenerPayload();

    if (!payload) {
      return null;
    }

    return (
      payload['sub'] ??
      payload['correo'] ??
      payload['email'] ??
      null
    );
  }


  obtenerRol(): string | null {

    const payload =
      this.obtenerPayload();

    if (!payload) {
      return null;
    }

    return payload['rol'] ?? null;
  }


  private obtenerPayload():
    Record<string, any> | null {

    const token =
      this.obtenerToken();

    if (!token) {
      return null;
    }


    try {

      const partes =
        token.split('.');

      if (partes.length !== 3) {
        return null;
      }


      let payloadBase64 =
        partes[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/');


      while (
        payloadBase64.length % 4
      ) {

        payloadBase64 += '=';
      }


      const payloadJson =
        decodeURIComponent(
          Array.prototype.map
            .call(
              atob(payloadBase64),
              (caracter: string) => {

                return (
                  '%' +
                  (
                    '00' +
                    caracter
                      .charCodeAt(0)
                      .toString(16)
                  ).slice(-2)
                );

              }
            )
            .join('')
        );


      return JSON.parse(
        payloadJson
      );

    } catch (error) {

      console.error(
        'No se pudo leer el token JWT:',
        error
      );

      return null;
    }
  }
}