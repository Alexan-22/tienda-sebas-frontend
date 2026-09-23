import {
  Component,
  Input
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  Producto
} from '../../../core/models/producto';


@Component({
  selector: 'app-product-card',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink
  ],

  templateUrl:
    './product-card.html',

  styleUrl:
    './product-card.css'
})
export class ProductCard {

  @Input({
    required: true
  })
  producto!: Producto;


  private readonly uploadsUrl =
    'http://localhost:8080/uploads/';


  get imagenUrl():
    string | null {

    if (!this.producto?.imagen) {
      return null;
    }

    return (
      this.uploadsUrl +
      this.producto.imagen
    );
  }


  get tieneOferta():
    boolean {

    return (
      this.producto?.precioOferta != null &&
      this.producto.precioOferta > 0 &&
      this.producto.precioOferta <
        this.producto.precio
    );
  }
}