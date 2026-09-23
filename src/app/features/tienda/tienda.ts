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
  ProductoService
} from '../../core/services/producto';

import {
  Producto
} from '../../core/models/producto';

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

  cargando = true;

  errorCarga = false;

  busqueda = '';

  generoSeleccionado = 0;

  categoriaSeleccionada = 0;

  soloNuevos = false;

  ordenSeleccionado = 'relevancia';


  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {

    /*
     * ESCUCHAR FILTROS DE LA URL
     *
     * /tienda
     * /tienda?genero=1
     * /tienda?genero=2
     * /tienda?genero=3
     * /tienda?genero=4
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


  cargarProductos(): void {

    this.cargando = true;

    this.errorCarga = false;


    this.productoService
      .listar()
      .subscribe({

        next: (
          productos: Producto[]
        ) => {

          this.productos =
            productos ?? [];


          this.aplicarFiltros();


          this.cargando = false;
        },


        error: (error) => {

          console.error(
            'Error cargando catálogo:',
            error
          );


          this.productos = [];

          this.productosFiltrados = [];


          this.errorCarga = true;

          this.cargando = false;
        }

      });
  }


  aplicarFiltros(): void {

    let resultado =
      [...this.productos];


    /*
     * BUSCADOR
     */
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


    /*
     * FILTRO POR GÉNERO
     */
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


    /*
     * FILTRO POR CATEGORÍA
     */
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


    /*
     * FILTRO NOVEDADES
     */
    if (this.soloNuevos) {

      resultado =
        resultado.filter(
          producto =>
            producto.nuevo === true
        );
    }


    /*
     * ORDENAMIENTO
     */
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


  precioFinal(
    producto: Producto
  ): number {

    if (
      producto.precioOferta != null &&
      producto.precioOferta > 0 &&
      producto.precioOferta <
        producto.precio
    ) {

      return producto.precioOferta;
    }


    return producto.precio;
  }


  seleccionarGenero(
    idGenero: number
  ): void {

    this.generoSeleccionado =
      idGenero;

    /*
     * Si el usuario cambia de género
     * manualmente, dejamos de mostrar
     * solamente novedades.
     */
    this.soloNuevos = false;

    this.aplicarFiltros();
  }


  seleccionarCategoria(
    idCategoria: number
  ): void {

    this.categoriaSeleccionada =
      idCategoria;

    this.aplicarFiltros();
  }


  limpiarFiltros(): void {

    this.busqueda = '';

    this.generoSeleccionado = 0;

    this.categoriaSeleccionada = 0;

    this.soloNuevos = false;

    this.ordenSeleccionado =
      'relevancia';

    this.aplicarFiltros();
  }

}