import { environment } from '../../../../environments/environment';
import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../core/models/producto';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input({ required: true })
  producto!: Producto;

  imagenError = false;

  private readonly uploadsUrl = `${environment.apiUrl}/uploads/`;

  get imagenUrl(): string | null {
    if (!this.producto?.imagen || this.imagenError) {
      return null;
    }

    return this.uploadsUrl + this.producto.imagen;
  }

  onImagenError(): void {
    this.imagenError = true;
  }

  get tieneOferta(): boolean {
    return (
      this.producto?.precioOferta != null &&
      this.producto.precioOferta > 0 &&
      this.producto.precioOferta < this.producto.precio
    );
  }

  get porcentajeDescuento(): number {
    if (!this.tieneOferta || this.producto.precioOferta == null) {
      return 0;
    }

    return Math.round(
      ((this.producto.precio - this.producto.precioOferta) / this.producto.precio) * 100
    );
  }
}