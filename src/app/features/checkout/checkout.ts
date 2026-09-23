import {
  Component
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  CarritoService
} from '../../core/services/carrito';

import {
  VentaService
} from '../../core/services/venta';

import {
  CompraRequest,
  CompraResponse
} from '../../core/models/venta';

import {
  DatosCheckout,
  MetodoPago
} from '../../core/models/checkout';

import {
  PromoBar
} from '../../shared/components/promo-bar/promo-bar';

import {
  Navbar
} from '../../shared/components/navbar/navbar';

import {
  Footer
} from '../../shared/components/footer/footer';


@Component({
  selector: 'app-checkout',

  standalone: true,

  imports: [
    FormsModule,
    DecimalPipe,
    RouterLink,
    PromoBar,
    Navbar,
    Footer
  ],

  templateUrl:
    './checkout.html',

  styleUrl:
    './checkout.css'
})
export class Checkout {

  readonly items;

  readonly subtotal;

  procesando = false;

  error = '';


  datos: DatosCheckout = {

    nombres: '',

    apellidos: '',

    telefono: '',

    direccion: '',

    distrito: '',

    referencia: '',

    metodoPago: 'YAPE'
  };


  constructor(
    public carritoService:
      CarritoService,

    private ventaService:
      VentaService,

    private router:
      Router
  ) {

    this.items =
      carritoService.items;

    this.subtotal =
      carritoService.subtotal;


    if (
      this.items().length === 0
    ) {

      this.router.navigate([
        '/carrito'
      ]);
    }
  }


  seleccionarPago(
    metodo: MetodoPago
  ): void {

    this.datos.metodoPago =
      metodo;
  }


  continuarPago(): void {

    this.error = '';


    if (
      !this.datos.nombres.trim() ||
      !this.datos.apellidos.trim() ||
      !this.datos.telefono.trim() ||
      !this.datos.direccion.trim() ||
      !this.datos.distrito.trim()
    ) {

      this.error =
        'Completa los datos obligatorios de entrega.';

      return;
    }


    if (
      !/^\d{9}$/.test(
        this.datos.telefono.trim()
      )
    ) {

      this.error =
        'Ingresa un número de teléfono válido de 9 dígitos.';

      return;
    }


    if (
      this.items().length === 0
    ) {

      this.error =
        'El carrito está vacío.';

      return;
    }


    const request:
      CompraRequest = {

      items:
        this.items().map(
          item => ({

            idProductoTalla:
              item.idProductoTalla,

            cantidad:
              item.cantidad

          })
        ),

      medioPago:
        this.datos.metodoPago
    };


    this.procesando = true;


    this.ventaService
      .comprar(request)
      .subscribe({

        next: (
          response:
            CompraResponse
        ) => {

          this.procesando =
            false;


          const cliente = {
            ...this.datos
          };


          this.carritoService
            .vaciar();


          this.router.navigate(
            ['/compra-exitosa'],
            {
              state: {
                compra:
                  response,

                cliente:
                  cliente
              }
            }
          );
        },


        error: (error) => {

          console.error(
            'Error realizando compra:',
            error
          );


          this.procesando =
            false;


          if (
            error.status === 401
          ) {

            this.error =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

            return;
          }


          if (
            error.status === 403
          ) {

            this.error =
              'No tienes autorización para realizar esta operación.';

            return;
          }


          this.error =
            typeof error.error ===
              'string'

              ? error.error

              : error?.error
                  ?.message ??
                'No se pudo registrar la compra.';
        }

      });
  }
}