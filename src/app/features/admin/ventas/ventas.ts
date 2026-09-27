import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Venta,
  DetalleVenta,
  DetalleCompraResponse
} from '../../../core/models/venta-detalle';

import {
  VentaService
} from '../../../core/services/venta';


@Component({
  selector: 'app-ventas',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas implements OnInit {

  // =========================================================
  // VENTAS
  // =========================================================

  ventas: Venta[] = [];

  ventasFiltradas: Venta[] = [];

  busqueda = '';

  filtroPago = '';

  filtroEstado = '';

  cargando = true;

  error = '';


  // =========================================================
  // DETALLE DE VENTA
  // =========================================================

  ventaSeleccionada: Venta | null = null;

  detalles: DetalleVenta[] = [];

  cargandoDetalle = false;

  errorDetalle = '';


  constructor(
    private ventaService: VentaService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INICIALIZAR
  // =========================================================

  ngOnInit(): void {

    this.cargarVentas();

  }


  // =========================================================
  // CARGAR TODAS LAS VENTAS
  // =========================================================

  cargarVentas(): void {

    this.cargando = true;

    this.error = '';


    this.ventaService
      .listarTodas()
      .subscribe({

        next: (
          ventas: Venta[]
        ) => {

          this.ventas =
            ventas ?? [];


          // Ordenar:
          // ventas más recientes primero

          this.ventas.sort(
            (
              a: Venta,
              b: Venta
            ) => {

              const fechaA =
                new Date(
                  a.fechaVenta
                ).getTime();


              const fechaB =
                new Date(
                  b.fechaVenta
                ).getTime();


              return (
                fechaB -
                fechaA
              );

            }
          );


          this.aplicarFiltros();

          this.cargando = false;


          // Forzar actualización visual

          this.cdr.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Error cargando ventas:',
            error
          );


          this.error =
            'No se pudieron cargar las ventas.';


          this.cargando = false;


          // Forzar actualización visual

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // FILTRAR VENTAS
  // =========================================================

  aplicarFiltros(): void {

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();


    this.ventasFiltradas =
      this.ventas.filter(
        (
          venta: Venta
        ) => {

          // -------------------------
          // ID DE VENTA
          // -------------------------

          const id =
            String(
              venta.idVenta
            );


          // -------------------------
          // NOMBRE DEL CLIENTE
          // -------------------------

          const nombre =
            venta.usuario
              ? (
                  `${venta.usuario.nombre ?? ''} ` +
                  `${venta.usuario.apellido ?? ''}`
                )
                  .trim()
                  .toLowerCase()
              : '';


          // -------------------------
          // CORREO
          // -------------------------

          const correo =
            venta.usuario
              ?.correo
              ?.toLowerCase() ?? '';


          // -------------------------
          // BUSCADOR
          // -------------------------

          const coincideBusqueda =
            !texto ||
            id.includes(texto) ||
            nombre.includes(texto) ||
            correo.includes(texto);


          // -------------------------
          // MEDIO DE PAGO
          // -------------------------

          const coincidePago =
            !this.filtroPago ||
            venta.medioPago ===
              this.filtroPago;


          // -------------------------
          // ESTADO
          // -------------------------

          const coincideEstado =
            !this.filtroEstado ||
            venta.estado ===
              this.filtroEstado;


          return (
            coincideBusqueda &&
            coincidePago &&
            coincideEstado
          );

        }
      );

  }


  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  limpiarFiltros(): void {

    this.busqueda = '';

    this.filtroPago = '';

    this.filtroEstado = '';

    this.aplicarFiltros();

  }


  // =========================================================
  // VER DETALLE DE VENTA
  // =========================================================

  verDetalle(
    venta: Venta
  ): void {

    // Guardar venta seleccionada

    this.ventaSeleccionada =
      venta;


    // Limpiar detalle anterior

    this.detalles = [];

    this.errorDetalle = '';

    this.cargandoDetalle = true;


    // Mostrar inmediatamente
    // el estado "Cargando detalle..."

    this.cdr.detectChanges();


    // IMPORTANTE:
    // El administrador utiliza el endpoint
    // /api/ventas/admin/{idVenta}/detalle

    this.ventaService
      .detalleVentaAdmin(
        venta.idVenta
      )
      .subscribe({

        next: (
          respuesta: DetalleCompraResponse
        ) => {

          console.log(
            'Detalle de venta recibido:',
            respuesta
          );


          this.detalles =
            respuesta.detalles ?? [];


          this.cargandoDetalle =
            false;


          // Actualizar inmediatamente el modal

          this.cdr.detectChanges();

        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Error cargando detalle:',
            error
          );


          this.detalles = [];


          this.errorDetalle =
            'No se pudo cargar el detalle de la venta.';


          this.cargandoDetalle =
            false;


          // Actualizar modal

          this.cdr.detectChanges();

        },


        complete: () => {

          // Seguridad adicional:
          // garantizar que nunca quede
          // permanentemente en "Cargando..."

          this.cargandoDetalle =
            false;


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // CERRAR DETALLE
  // =========================================================

  cerrarDetalle(): void {

    this.ventaSeleccionada =
      null;


    this.detalles = [];


    this.errorDetalle = '';


    this.cargandoDetalle =
      false;


    this.cdr.detectChanges();

  }


  // =========================================================
  // TOTAL DE VENTAS
  // =========================================================

  get totalVentas(): number {

    return this.ventas.length;

  }


  // =========================================================
  // INGRESOS TOTALES
  // =========================================================

  get ingresosTotales(): number {

    return this.ventas.reduce(

      (
        total: number,
        venta: Venta
      ) => {

        return (
          total +
          Number(
            venta.total ?? 0
          )
        );

      },

      0

    );

  }


  // =========================================================
  // VENTA PROMEDIO
  // =========================================================

  get ventaPromedio(): number {

    if (
      this.totalVentas === 0
    ) {

      return 0;

    }


    return (
      this.ingresosTotales /
      this.totalVentas
    );

  }


  // =========================================================
  // VENTAS YAPE
  // =========================================================

  get ventasYape(): number {

    return this.ventas.filter(
      (
        venta: Venta
      ) =>

        venta.medioPago
          ?.toUpperCase() ===
        'YAPE'

    ).length;

  }


  // =========================================================
  // VENTAS TARJETA
  // =========================================================

  get ventasTarjeta(): number {

    return this.ventas.filter(
      (
        venta: Venta
      ) =>

        venta.medioPago
          ?.toUpperCase() ===
        'TARJETA'

    ).length;

  }


  // =========================================================
  // ESTADOS DISPONIBLES
  // =========================================================

  get estados(): string[] {

    return [
      ...new Set(

        this.ventas
          .map(
            (
              venta: Venta
            ) =>
              venta.estado
          )
          .filter(
            (
              estado: string
            ) =>
              Boolean(
                estado
              )
          )

      )
    ];

  }


  // =========================================================
  // NOMBRE DEL CLIENTE
  // =========================================================

  nombreCliente(
    venta: Venta
  ): string {

    if (
      !venta.usuario
    ) {

      return 'Sin cliente';

    }


    const nombre =
      (
        `${venta.usuario.nombre ?? ''} ` +
        `${venta.usuario.apellido ?? ''}`
      ).trim();


    return (
      nombre ||
      'Sin cliente'
    );

  }


  // =========================================================
  // CORREO DEL CLIENTE
  // =========================================================

  correoCliente(
    venta: Venta
  ): string {

    return (
      venta.usuario
        ?.correo ??
      'Sin correo'
    );

  }


  // =========================================================
  // CANTIDAD DE PRODUCTOS DEL DETALLE
  // =========================================================

  get cantidadProductosDetalle(): number {

    return this.detalles.reduce(

      (
        total: number,
        detalle: DetalleVenta
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

}