import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  AuthService
} from '../services/auth';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.obtenerToken();


  // No existe sesión: continuar sin Authorization.
  if (!token) {
    return next(req);
  }


  // Comprobar el JWT antes de realizar la petición.
  if (tokenExpirado(token)) {

    authService.logout();

    router.navigate(['/login']);

    return next(req);
  }


  // Token válido: agregarlo a la petición.
  const requestConToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });


  return next(requestConToken).pipe(

    catchError((error: HttpErrorResponse) => {

      /*
       * 401:
       * El servidor ya no reconoce la autenticación.
       *
       * 403 no provoca logout automáticamente,
       * porque también puede significar que el usuario
       * está autenticado pero no tiene el rol necesario.
       */
      if (error.status === 401) {

        authService.logout();

        router.navigate(['/login']);

      }

      return throwError(() => error);
    })

  );
};


function tokenExpirado(
  token: string
): boolean {

  try {

    const partes =
      token.split('.');

    if (partes.length !== 3) {
      return true;
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


    const payload =
      JSON.parse(payloadJson);


    if (!payload.exp) {
      return true;
    }


    const ahora =
      Math.floor(
        Date.now() / 1000
      );


    return payload.exp <= ahora;

  } catch {

    return true;
  }
}