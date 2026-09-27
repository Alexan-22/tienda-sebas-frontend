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
  forkJoin,
  of
} from 'rxjs';

import {
  catchError
} from 'rxjs/operators';

import {
  CarritoService
} from '../../core/services/carrito';

import {
  VentaService
} from '../../core/services/venta';

import {
  ProductoTallaService
} from '../../core/services/producto-talla';

import {
  CompraRequest,
  CompraResponse
} from '../../core/models/venta';

import {
  DatosCheckout,
  MetodoPago
} from '../../core/models/checkout';

import {
  ProductoTalla
} from '../../core/models/producto-talla';

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

    private productoTallaService:
      ProductoTallaService,

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


    this.validarStockAntesDeComprar();
  }


  private validarStockAntesDeComprar(): void {

    const itemsActuales =
      this.carritoService.items();


    if (
      itemsActuales.length === 0
    ) {

      this.error =
        'El carrito está vacío.';

      return;
    }


    this.procesando = true;

    this.error = '';


    const productosUnicos = [
      ...new Set(
        itemsActuales.map(
          item => item.idProducto
        )
      )
    ];


    const consultas =
      productosUnicos.map(
        idProducto =>

          this.productoTallaService
            .listarPorProducto(
              idProducto
            )
            .pipe(

              catchError(error => {

                console.error(
                  'Error consultando stock del producto:',
                  idProducto,
                  error
                );

                return of(
                  null as
                    ProductoTalla[] |
                    null
                );

              })

            )
      );


    forkJoin(consultas)
      .subscribe({

        next: respuestas => {

          const consultaFallida =
            respuestas.some(
              respuesta =>
                respuesta === null
            );


          if (consultaFallida) {

            this.procesando =
              false;

            this.error =
              'No se pudo verificar el stock. Intenta nuevamente.';

            return;
          }


          const tallas =
            respuestas
              .filter(
                (
                  respuesta
                ): respuesta is
                  ProductoTalla[] =>
                    respuesta !== null
              )
              .flat();


          let stockModificado =
            false;


          let productoNoDisponible =
            false;


          for (
            const item
            of itemsActuales
          ) {

            const productoTalla =
              tallas.find(
                talla =>
                  talla.idProductoTalla ===
                  item.idProductoTalla
              );


            if (!productoTalla) {

              productoNoDisponible =
                true;

              continue;
            }


            const stockActual =
              Math.max(
                0,
                productoTalla.stock
              );


            if (
              stockActual !==
              item.stock
            ) {

              stockModificado =
                true;
            }


            if (
              stockActual <= 0
            ) {

              productoNoDisponible =
                true;
            }


            if (
              item.cantidad >
              stockActual
            ) {

              stockModificado =
                true;
            }


            this.carritoService
              .actualizarStock(
                item.idProductoTalla,
                stockActual
              );
          }


          if (
            productoNoDisponible
          ) {

            this.procesando =
              false;

            this.error =
              'Uno o más productos ya no tienen stock disponible. Regresa al carrito para actualizar tu pedido.';

            return;
          }


          if (
            stockModificado
          ) {

            this.procesando =
              false;

            this.error =
              'El stock de tu carrito cambió. Hemos actualizado las cantidades disponibles. Revisa tu pedido antes de continuar.';

            return;
          }


          this.registrarCompra();
        },


        error: error => {

          console.error(
            'Error verificando stock:',
            error
          );


          this.procesando =
            false;

          this.error =
            'No se pudo verificar el stock. Intenta nuevamente.';
        }

      });
  }


  private registrarCompra(): void {

    const itemsActuales =
      this.carritoService.items();


    if (
      itemsActuales.length === 0
    ) {

      this.procesando =
        false;

      this.error =
        'El carrito está vacío.';

      return;
    }


    const request:
      CompraRequest = {

      items:
        itemsActuales.map(
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


        error: error => {

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