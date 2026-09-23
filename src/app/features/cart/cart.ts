import {
  Component
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  CarritoService
} from '../../core/services/carrito';

import {
  AuthService
} from '../../core/services/auth';

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
  selector: 'app-cart',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PromoBar,
    Navbar,
    Footer
  ],

  templateUrl: './cart.html',

  styleUrl: './cart.css'
})
export class Cart {

  readonly items;

  readonly subtotal;


  private readonly uploadsUrl =
    'http://localhost:8080/uploads/';


  constructor(
    public carritoService:
      CarritoService,

    private authService:
      AuthService,

    private router:
      Router
  ) {

    this.items =
      carritoService.items;

    this.subtotal =
      carritoService.subtotal;
  }


  aumentar(
    idProductoTalla: number,
    cantidad: number
  ): void {

    this.carritoService
      .cambiarCantidad(
        idProductoTalla,
        cantidad + 1
      );
  }


  disminuir(
    idProductoTalla: number,
    cantidad: number
  ): void {

    if (cantidad <= 1) {
      return;
    }


    this.carritoService
      .cambiarCantidad(
        idProductoTalla,
        cantidad - 1
      );
  }


  eliminar(
    idProductoTalla: number
  ): void {

    this.carritoService
      .eliminar(
        idProductoTalla
      );
  }


  imagenUrl(
    imagen: string | null
  ): string | null {

    if (!imagen) {
      return null;
    }


    return (
      this.uploadsUrl +
      imagen
    );
  }


  continuarCompra(): void {

    if (
      this.carritoService
        .items()
        .length === 0
    ) {
      return;
    }


    if (
      !this.authService
        .autenticado()
    ) {

      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl:
              '/checkout'
          }
        }
      );

      return;
    }


    this.router.navigate([
      '/checkout'
    ]);
  }
}