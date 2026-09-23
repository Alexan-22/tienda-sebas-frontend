import {
  Component,
  OnInit
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Producto
} from '../../core/models/producto';

import {
  ProductoTalla
} from '../../core/models/producto-talla';

import {
  ProductoService
} from '../../core/services/producto';

import {
  ProductoTallaService
} from '../../core/services/producto-talla';

import {
  CarritoService
} from '../../core/services/carrito';

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
  selector: 'app-product-detail',

  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    PromoBar,
    Navbar,
    Footer
  ],

  templateUrl:
    './product-detail.html',

  styleUrl:
    './product-detail.css'
})
export class ProductDetail
  implements OnInit {

  producto:
    Producto | null = null;

  tallas:
    ProductoTalla[] = [];

  tallaSeleccionada:
    ProductoTalla | null = null;

  cantidad = 1;

  cargando = true;

  cargandoTallas = true;

  errorCarga = false;

  productoAgregado = false;


  private readonly uploadsUrl =
    'http://localhost:8080/uploads/';


  constructor(
    private route:
      ActivatedRoute,

    private router:
      Router,

    private productoService:
      ProductoService,

    private productoTallaService:
      ProductoTallaService,

    private carritoService:
      CarritoService
  ) {}


  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (!id) {

      this.errorCarga = true;

      this.cargando = false;

      this.cargandoTallas = false;

      return;
    }


    this.cargarProducto(id);

    this.cargarTallas(id);
  }


  cargarProducto(
    id: number
  ): void {

    this.productoService
      .buscarPorId(id)
      .subscribe({

        next: (
          producto: Producto
        ) => {

          this.producto =
            producto;

          this.cargando =
            false;
        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Error cargando producto:',
            error
          );

          this.errorCarga =
            true;

          this.cargando =
            false;
        }

      });
  }


  cargarTallas(
    idProducto: number
  ): void {

    this.cargandoTallas =
      true;


    this.productoTallaService
      .listarPorProducto(
        idProducto
      )
      .subscribe({

        next: (
          tallas:
            ProductoTalla[]
        ) => {

          this.tallas =
            tallas;

          this.cargandoTallas =
            false;
        },


        error: (
          error: unknown
        ) => {

          console.error(
            'Error cargando tallas:',
            error
          );

          this.tallas = [];

          this.cargandoTallas =
            false;
        }

      });
  }


  seleccionarTalla(
    productoTalla:
      ProductoTalla
  ): void {

    if (
      productoTalla.stock <= 0
    ) {
      return;
    }


    this.tallaSeleccionada =
      productoTalla;

    this.cantidad = 1;
  }


  aumentarCantidad(): void {

    if (
      !this.tallaSeleccionada
    ) {
      return;
    }


    if (
      this.cantidad <
      this.tallaSeleccionada.stock
    ) {

      this.cantidad++;
    }
  }


  disminuirCantidad(): void {

    if (this.cantidad > 1) {

      this.cantidad--;
    }
  }


  agregarAlCarrito(): void {

    if (
      !this.producto ||
      !this.tallaSeleccionada
    ) {
      return;
    }


    this.carritoService.agregar({

      idProducto:
        this.producto.idProducto,

      idProductoTalla:
        this.tallaSeleccionada
          .idProductoTalla,

      nombre:
        this.producto.nombre,

      talla:
        this.tallaSeleccionada
          .talla
          .nombreTalla,

      imagen:
        this.producto.imagen,

      precio:
        this.precioActual,

      cantidad:
        this.cantidad,

      stock:
        this.tallaSeleccionada
          .stock
    });


    this.productoAgregado =
      true;


    setTimeout(() => {

      this.productoAgregado =
        false;

    }, 2000);
  }


  comprarAhora(): void {

    if (
      !this.producto ||
      !this.tallaSeleccionada
    ) {
      return;
    }


    this.agregarAlCarrito();

    this.router.navigate([
      '/carrito'
    ]);
  }


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
      this.producto
        ?.precioOferta != null &&

      this.producto
        .precioOferta > 0 &&

      this.producto
        .precioOferta <
      this.producto.precio
    );
  }


  get precioActual():
    number {

    if (!this.producto) {

      return 0;
    }


    if (
      this.tieneOferta &&
      this.producto.precioOferta
        != null
    ) {

      return this.producto
        .precioOferta;
    }


    return this.producto.precio;
  }


  get hayStock():
    boolean {

    return this.tallas.some(
      talla =>
        talla.stock > 0
    );
  }
}