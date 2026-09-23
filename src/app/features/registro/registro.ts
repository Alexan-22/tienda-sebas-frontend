import {
  Component
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth';


@Component({
  selector: 'app-registro',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './registro.html',

  styleUrl:
    './registro.css'
})
export class Registro {

  nombre = '';

  apellido = '';

  correo = '';

  password = '';

  confirmarPassword = '';

  mostrarPassword = false;

  cargando = false;

  error = '';

  mensaje = '';


  constructor(
    private authService:
      AuthService,

    private router:
      Router
  ) {}


  registrar(): void {

    this.error = '';

    this.mensaje = '';


    if (
      !this.nombre.trim() ||
      !this.apellido.trim() ||
      !this.correo.trim() ||
      !this.password
    ) {

      this.error =
        'Completa todos los campos obligatorios.';

      return;
    }


    if (
      this.password.length < 6
    ) {

      this.error =
        'La contraseña debe tener al menos 6 caracteres.';

      return;
    }


    if (
      this.password !==
      this.confirmarPassword
    ) {

      this.error =
        'Las contraseñas no coinciden.';

      return;
    }


    this.cargando = true;


    this.authService
      .registrar({

        nombre:
          this.nombre.trim(),

        apellido:
          this.apellido.trim(),

        correo:
          this.correo
            .trim()
            .toLowerCase(),

        password:
          this.password

      })
      .subscribe({

        next: (
          mensaje: string
        ) => {

          this.cargando =
            false;

          this.mensaje =
            mensaje;


          setTimeout(() => {

            this.router.navigate(
              ['/login'],
              {
                queryParams: {
                  registrado:
                    'true'
                }
              }
            );

          }, 800);
        },


        error: (error) => {

          console.error(
            'Error registrando usuario:',
            error
          );

          this.cargando =
            false;


          if (
            typeof error.error ===
            'string'
          ) {

            this.error =
              error.error;

          } else {

            this.error =
              'No se pudo crear la cuenta.';
          }
        }

      });
  }
}