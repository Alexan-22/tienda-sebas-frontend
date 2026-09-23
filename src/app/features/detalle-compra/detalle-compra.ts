import {
  Component,
  OnInit
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  VentaService
} from '../../core/services/venta';

import {
  DetalleVenta
} from '../../core/models/venta-detalle';

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
  selector: 'app-detalle-compra',
  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PromoBar,
    Navbar,
    Footer
  ],

  templateUrl: './detalle-compra.html',
  styleUrl: './detalle-compra.css'
})
export class DetalleCompra implements OnInit {

  idVenta = 0;

  detalles: DetalleVenta[] = [];

  cargando = true;
  error = false;


  constructor(
    private route: ActivatedRoute,
    private ventaService: VentaService
  ) {}


  ngOnInit(): void {

    this.idVenta =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );

    if (!this.idVenta) {

      this.error = true;
      this.cargando = false;

      return;
    }

    this.cargarDetalle();
  }


  cargarDetalle(): void {

    this.ventaService
      .detalleVenta(this.idVenta)
      .subscribe({

        next: (detalles) => {

          this.detalles = detalles;

          this.cargando = false;
        },

        error: (error) => {

          console.error(
            'Error cargando detalle:',
            error
          );

          this.error = true;

          this.cargando = false;
        }

      });
  }


  get total(): number {

    return this.detalles.reduce(
      (total, detalle) =>
        total + detalle.subtotal,
      0
    );
  }


  imprimir(): void {
    window.print();
  }
}