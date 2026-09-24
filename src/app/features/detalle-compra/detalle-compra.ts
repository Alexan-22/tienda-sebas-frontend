import {
  ChangeDetectorRef,
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

  templateUrl:
    './detalle-compra.html',

  styleUrl:
    './detalle-compra.css'
})
export class DetalleCompra implements OnInit {

  idVenta = 0;

  detalles: DetalleVenta[] = [];

  cargando = true;

  error = false;


  constructor(
    private route: ActivatedRoute,

    private ventaService: VentaService,

    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {

    const idParam =
      this.route.snapshot
        .paramMap
        .get('id');


    this.idVenta =
      Number(idParam);


    if (
      !this.idVenta ||
      Number.isNaN(this.idVenta)
    ) {

      this.error = true;

      this.cargando = false;

      this.cdr.detectChanges();

      return;
    }


    this.cargarDetalle();
  }


  // ==========================================
  // CARGAR DETALLE DE LA VENTA
  // ==========================================

  cargarDetalle(): void {

    this.cargando = true;

    this.error = false;


    this.ventaService
      .detalleVenta(
        this.idVenta
      )
      .subscribe({

        next: (
          detalles: DetalleVenta[]
        ) => {

          console.log(
            'DETALLE DE VENTA:',
            detalles
          );


          this.detalles =
            detalles ?? [];


          this.cargando =
            false;


          this.error =
            false;


          this.cdr.detectChanges();
        },


        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR CARGANDO DETALLE:',
            error
          );


          this.detalles = [];

          this.error = true;

          this.cargando = false;


          this.cdr.detectChanges();
        }

      });
  }


  // ==========================================
  // TOTAL
  // ==========================================

  get total(): number {

    return this.detalles.reduce(
      (
        total,
        detalle
      ) => {

        return (
          total +
          Number(
            detalle.subtotal ?? 0
          )
        );

      },
      0
    );
  }


  // ==========================================
  // TOTAL DE PRODUCTOS
  // ==========================================

  get totalProductos(): number {

    return this.detalles.reduce(
      (
        total,
        detalle
      ) => {

        return (
          total +
          Number(
            detalle.cantidad ?? 0
          )
        );

      },
      0
    );
  }


  // ==========================================
  // IMPRIMIR
  // ==========================================

  imprimir(): void {

    window.print();
  }

}