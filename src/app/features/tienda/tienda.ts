import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import {
  forkJoin,
  of
} from 'rxjs';

import {
  catchError
} from 'rxjs/operators';

import {
  ProductoService
} from '../../core/services/producto';

import {
  ProductoTallaService
} from '../../core/services/producto-talla';

import {
  Producto
} from '../../core/models/producto';

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

import {
  ProductCard
} from '../../shared/components/product-card/product-card';


interface InventarioProducto {
  [idProducto: number]: ProductoTalla[];
}


@Component({
  selector: 'app-tienda',

  standalone: true,

  imports: [
    FormsModule,
    PromoBar,
    Navbar,
    Footer,
    ProductCard
  ],

  templateUrl: './tienda.html',
  styleUrl: './tienda.css'
})
export class Tienda implements OnInit {

  productos: Producto[] = [];

  productosFiltrados: Producto[] = [];

  inventario: InventarioProducto = {};

  cargando = true;

  errorCarga = false;


  // ==========================================
  // FILTROS
  // ==========================================

  busqueda = '';

  generoSeleccionado = 0;

  categoriaSeleccionada = 0;

  tallaSeleccionada = 0;

  soloNuevos = false;

  soloOfertas = false;

  soloDisponibles = false;

  precioMinimo: number | null = null;

  precioMaximo: number | null = null;

  ordenSeleccionado = 'relevancia';


  constructor(
    private productoService: ProductoService,
    private productoTallaService: ProductoTallaService,
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {

    /*
     * ESCUCHAR FILTROS DE LA URL
     *
     * /tienda
     * /tienda?genero=1
     * /tienda?categoria=2
     * /tienda?nuevo=true
     */

    this.route.queryParamMap
      .subscribe(params => {

        this.generoSeleccionado =
          Number(
            params.get('genero')
          ) || 0;


        this.categoriaSeleccionada =
          Number(
            params.get('categoria')
          ) || 0;


        this.soloNuevos =
          params.get('nuevo') === 'true';


        this.aplicarFiltros();

      });


    this.cargarProductos();
  }


  // ==========================================
  // CARGAR PRODUCTOS
  // ==========================================

  cargarProductos(): void {

    this.cargando = true;

    this.errorCarga = false;


    this.productoService
      .listar()
      .subscribe({

        next: productos => {

          this.productos =
            productos ?? [];


          if (
            this.productos.length === 0
          ) {

            this.productosFiltrados = [];

            this.inventario = {};

            this.cargando = false;

            return;
          }


          this.cargarInventario();

        },


        error: error => {

          console.error(
            'Error cargando catálogo:',
            error
          );


          this.productos = [];

          this.productosFiltrados = [];

          this.inventario = {};

          this.errorCarga = true;

          this.cargando = false;

        }

      });

  }


  // ==========================================
  // CARGAR TALLAS Y STOCK
  // ==========================================

  cargarInventario(): void {

    const consultas =
      this.productos.map(
        producto =>
          this.productoTallaService
            .listarPorProducto(
              producto.idProducto
            )
            .pipe(
              catchError(error => {

                console.error(
                  `Error cargando tallas del producto ${producto.idProducto}:`,
                  error
                );

                return of([]);
              })
            )
      );


    forkJoin(consultas)
      .subscribe({

        next: resultados => {

          this.inventario = {};


          this.productos.forEach(
            (producto, index) => {

              this.inventario[
                producto.idProducto
              ] =
                resultados[index] ?? [];

            }
          );


          this.aplicarFiltros();

          this.cargando = false;

        },


        error: error => {

          console.error(
            'Error cargando inventario:',
            error
          );


          this.inventario = {};

          this.aplicarFiltros();

          this.cargando = false;

        }

      });

  }


  // ==========================================
  // APLICAR FILTROS
  // ==========================================

  aplicarFiltros(): void {

    let resultado =
      [...this.productos];


    // ------------------------------------------
    // BUSCADOR
    // ------------------------------------------

    const texto =
      this.busqueda
        .trim()
        .toLowerCase();


    if (texto) {

      resultado =
        resultado.filter(
          producto => {

            const nombre =
              producto.nombre
                ?.toLowerCase() ?? '';


            const descripcion =
              producto.descripcion
                ?.toLowerCase() ?? '';


            const categoria =
              producto.categoria
                ?.nombreCategoria
                ?.toLowerCase() ?? '';


            const genero =
              producto.genero
                ?.nombreGenero
                ?.toLowerCase() ?? '';


            return (
              nombre.includes(texto) ||
              descripcion.includes(texto) ||
              categoria.includes(texto) ||
              genero.includes(texto)
            );

          }
        );

    }


    // ------------------------------------------
    // GÉNERO
    // ------------------------------------------

    if (
      this.generoSeleccionado !== 0
    ) {

      resultado =
        resultado.filter(
          producto =>
            producto.genero
              ?.idGenero ===
            this.generoSeleccionado
        );

    }


    // ------------------------------------------
    // CATEGORÍA
    // ------------------------------------------

    if (
      this.categoriaSeleccionada !== 0
    ) {

      resultado =
        resultado.filter(
          producto =>
            producto.categoria
              ?.idCategoria ===
            this.categoriaSeleccionada
        );

    }


    // ------------------------------------------
    // NOVEDADES
    // ------------------------------------------

    if (this.soloNuevos) {

      resultado =
        resultado.filter(
          producto =>
            producto.nuevo === true
        );

    }


    // ------------------------------------------
    // OFERTAS
    // ------------------------------------------

    if (this.soloOfertas) {

      resultado =
        resultado.filter(
          producto =>
            this.tieneOferta(producto)
        );

    }


    // ------------------------------------------
    // DISPONIBILIDAD
    // ------------------------------------------

    if (this.soloDisponibles) {

      resultado =
        resultado.filter(
          producto =>
            this.stockTotal(producto) > 0
        );

    }


    // ------------------------------------------
    // TALLA
    // ------------------------------------------

    if (
      this.tallaSeleccionada !== 0
    ) {

      resultado =
        resultado.filter(
          producto =>
            this.tieneTallaDisponible(
              producto,
              this.tallaSeleccionada
            )
        );

    }


    // ------------------------------------------
    // PRECIO MÍNIMO
    // ------------------------------------------

    if (
      this.precioMinimo != null &&
      this.precioMinimo >= 0
    ) {

      resultado =
        resultado.filter(
          producto =>
            this.precioFinal(producto) >=
            Number(this.precioMinimo)
        );

    }


    // ------------------------------------------
    // PRECIO MÁXIMO
    // ------------------------------------------

    if (
      this.precioMaximo != null &&
      this.precioMaximo >= 0
    ) {

      resultado =
        resultado.filter(
          producto =>
            this.precioFinal(producto) <=
            Number(this.precioMaximo)
        );

    }


    // ------------------------------------------
    // ORDENAMIENTO
    // ------------------------------------------

    switch (
      this.ordenSeleccionado
    ) {

      case 'precio-asc':

        resultado.sort(
          (a, b) =>
            this.precioFinal(a) -
            this.precioFinal(b)
        );

        break;


      case 'precio-desc':

        resultado.sort(
          (a, b) =>
            this.precioFinal(b) -
            this.precioFinal(a)
        );

        break;


      case 'nombre':

        resultado.sort(
          (a, b) =>
            a.nombre.localeCompare(
              b.nombre
            )
        );

        break;

    }


    this.productosFiltrados =
      resultado;

  }


  // ==========================================
  // PRECIO FINAL
  // ==========================================

  precioFinal(
    producto: Producto
  ): number {

    if (
      producto.precioOferta != null &&
      producto.precioOferta > 0 &&
      producto.precioOferta <
        producto.precio
    ) {

      return Number(
        producto.precioOferta
      );

    }


    return Number(
      producto.precio
    );

  }


  // ==========================================
  // TIENE OFERTA
  // ==========================================

  tieneOferta(
    producto: Producto
  ): boolean {

    return (
      producto.precioOferta != null &&
      Number(producto.precioOferta) > 0 &&
      Number(producto.precioOferta) <
      Number(producto.precio)
    );

  }


  // ==========================================
  // STOCK TOTAL
  // ==========================================

  stockTotal(
    producto: Producto
  ): number {

    const tallas =
      this.inventario[
        producto.idProducto
      ] ?? [];


    return tallas.reduce(
      (
        total,
        productoTalla
      ) =>
        total +
        Number(
          productoTalla.stock ?? 0
        ),
      0
    );

  }


  // ==========================================
  // TIENE TALLA DISPONIBLE
  // ==========================================

  tieneTallaDisponible(
    producto: Producto,
    idTalla: number
  ): boolean {

    const tallas =
      this.inventario[
        producto.idProducto
      ] ?? [];


    return tallas.some(
      productoTalla =>
        productoTalla.talla
          ?.idTalla === idTalla &&
        Number(
          productoTalla.stock
        ) > 0
    );

  }


  // ==========================================
  // SELECCIONAR GÉNERO
  // ==========================================

  seleccionarGenero(
    idGenero: number
  ): void {

    this.generoSeleccionado =
      idGenero;

    this.aplicarFiltros();

  }


  // ==========================================
  // SELECCIONAR CATEGORÍA
  // ==========================================

  seleccionarCategoria(
    idCategoria: number
  ): void {

    this.categoriaSeleccionada =
      idCategoria;

    this.aplicarFiltros();

  }


  // ==========================================
  // SELECCIONAR TALLA
  // ==========================================

  seleccionarTalla(
    idTalla: number
  ): void {

    if (
      this.tallaSeleccionada === idTalla
    ) {

      this.tallaSeleccionada = 0;

    } else {

      this.tallaSeleccionada =
        idTalla;

    }


    this.aplicarFiltros();

  }


  // ==========================================
  // LIMPIAR FILTROS
  // ==========================================

  limpiarFiltros(): void {

    this.busqueda = '';

    this.generoSeleccionado = 0;

    this.categoriaSeleccionada = 0;

    this.tallaSeleccionada = 0;

    this.soloNuevos = false;

    this.soloOfertas = false;

    this.soloDisponibles = false;

    this.precioMinimo = null;

    this.precioMaximo = null;

    this.ordenSeleccionado =
      'relevancia';


    this.aplicarFiltros();

  }

}