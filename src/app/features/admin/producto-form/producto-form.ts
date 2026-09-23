import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Categoria,
  Genero,
  Producto
} from '../../../core/models/producto';

import {
  ProductoService
} from '../../../core/services/producto';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css'
})
export class ProductoForm implements OnInit {

  idProducto: number | null = null;

  editando = false;
  cargando = false;
  guardando = false;

  error = '';

  nombre = '';
  descripcion = '';

  precio: number | null = null;
  precioOferta: number | null = null;

  idGenero: number | null = null;
  idCategoria: number | null = null;

  imagen: string | null = null;

  nuevo = false;
  destacado = false;
  estado = true;

  generos: Genero[] = [
    {
      idGenero: 1,
      nombreGenero: 'Hombre',
      estado: true
    },
    {
      idGenero: 2,
      nombreGenero: 'Mujer',
      estado: true
    },
    {
      idGenero: 3,
      nombreGenero: 'Niño',
      estado: true
    },
    {
      idGenero: 4,
      nombreGenero: 'Niña',
      estado: true
    }
  ];

  categorias: Categoria[] = [
    {
      idCategoria: 1,
      nombreCategoria: 'Polos',
      estado: true
    },
    {
      idCategoria: 2,
      nombreCategoria: 'Camisas',
      estado: true
    },
    {
      idCategoria: 3,
      nombreCategoria: 'Pantalones',
      estado: true
    },
    {
      idCategoria: 4,
      nombreCategoria: 'Casacas',
      estado: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot
          .paramMap.get('id')
      );

    if (id > 0) {

      this.idProducto = id;
      this.editando = true;

      this.cargarProducto(id);
    }
  }

  cargarProducto(
    idProducto: number
  ): void {

    this.cargando = true;

    this.productoService
      .buscarPorId(idProducto)
      .subscribe({

        next: producto => {

          this.nombre =
            producto.nombre;

          this.descripcion =
            producto.descripcion ?? '';

          this.precio =
            producto.precio;

          this.precioOferta =
            producto.precioOferta;

          this.idGenero =
            producto.genero?.idGenero ?? null;

          this.idCategoria =
            producto.categoria?.idCategoria ?? null;

          this.imagen =
            producto.imagen;

          this.nuevo =
            producto.nuevo;

          this.destacado =
            producto.destacado;

          this.estado =
            producto.estado;

          this.cargando = false;
        },

        error: error => {

          console.error(error);

          this.error =
            'No se pudo cargar el producto.';

          this.cargando = false;
        }

      });
  }

  guardar(): void {

    this.error = '';

    if (!this.nombre.trim()) {
      this.error =
        'Ingresa el nombre.';
      return;
    }

    if (
      this.precio == null ||
      this.precio <= 0
    ) {
      this.error =
        'Ingresa un precio válido.';
      return;
    }

    if (
      !this.idGenero ||
      !this.idCategoria
    ) {
      this.error =
        'Selecciona género y categoría.';
      return;
    }

    const producto:
      Partial<Producto> = {

      nombre:
        this.nombre.trim(),

      descripcion:
        this.descripcion.trim(),

      precio:
        this.precio,

      precioOferta:
        this.precioOferta || null,

      imagen:
        this.imagen,

      nuevo:
        this.nuevo,

      destacado:
        this.destacado,

      estado:
        this.estado
    };

    this.guardando = true;

    if (
      this.editando &&
      this.idProducto
    ) {

      this.productoService
        .actualizar(
          this.idProducto,
          producto,
          this.idGenero,
          this.idCategoria
        )
        .subscribe({

          next: () => {
            this.router.navigate([
              '/admin/productos'
            ]);
          },

          error: error => {
            console.error(error);

            this.error =
              'No se pudo actualizar.';

            this.guardando = false;
          }

        });

      return;
    }

    this.productoService
      .crear(
        producto,
        this.idGenero,
        this.idCategoria
      )
      .subscribe({

        next: () => {
          this.router.navigate([
            '/admin/productos'
          ]);
        },

        error: error => {
          console.error(error);

          this.error =
            'No se pudo crear el producto.';

          this.guardando = false;
        }

      });
  }
}