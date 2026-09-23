import {
  Component,
  OnInit
} from '@angular/core';

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
  selector: 'app-home',
  standalone: true,

  imports: [
    PromoBar,
    Navbar,
    Footer,
    ProductCard
  ],

  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  productos: Producto[] = [];

  cargando = true;

  errorCarga = false;


  constructor(
    private productoService: ProductoService
  ) {}


  ngOnInit(): void {
    this.cargarProductos();
  }


  cargarProductos(): void {

    this.cargando = true;
    this.errorCarga = false;

    this.productoService
      .listar()
      .subscribe({

        next: (productos: Producto[]) => {

          console.log(
            'Productos recibidos:',
            productos
          );

          this.productos = productos.slice(0, 8);

          this.cargando = false;
        },

        error: (error) => {

          console.error(
            'Error cargando productos:',
            error
          );

          this.productos = [];
          this.errorCarga = true;
          this.cargando = false;
        }

      });
  }
}