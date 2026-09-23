import {
  Component,
  OnInit
} from '@angular/core';

import {
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  VentaService
} from '../../core/services/venta';

import {
  Venta
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
  selector: 'app-mis-compras',
  standalone: true,

  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    PromoBar,
    Navbar,
    Footer
  ],

  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css'
})
export class MisCompras implements OnInit {

  ventas: Venta[] = [];

  cargando = true;
  error = false;

  constructor(
    private ventaService: VentaService
  ) {}


  ngOnInit(): void {
    this.cargarCompras();
  }


  cargarCompras(): void {

    this.cargando = true;
    this.error = false;

    this.ventaService
      .misCompras()
      .subscribe({

        next: (ventas) => {

          this.ventas = ventas;

          this.cargando = false;
        },

        error: (error) => {

          console.error(
            'Error cargando compras:',
            error
          );

          this.error = true;

          this.cargando = false;
        }

      });
  }
}