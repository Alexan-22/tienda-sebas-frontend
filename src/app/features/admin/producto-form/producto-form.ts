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

import {
  ImagenService
} from '../../../core/services/imagen';


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
  subiendoImagen = false;

  error = '';
  errorImagen = '';

  nombre = '';
  descripcion = '';

  precio: number | null = null;
  precioOferta: number | null = null;

  idGenero: number | null = null;
  idCategoria: number | null = null;

  imagen: string | null = null;

  archivoImagen: File | null = null;

  previewImagen: string | null = null;

  nuevo = false;
  destacado = false;
  estado = true;

  private readonly uploadsUrl =
    'http://localhost:8080/uploads/';


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
    private productoService: ProductoService,
    private imagenService: ImagenService
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


  // =========================================================
  // CARGAR PRODUCTO
  // =========================================================

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


  // =========================================================
  // SELECCIONAR IMAGEN
  // =========================================================

  seleccionarImagen(
    event: Event
  ): void {

    this.errorImagen = '';

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const archivo =
      input.files[0];


    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      this.errorImagen =
        'Solo se permiten imágenes JPG, PNG o WEBP.';

      input.value = '';

      return;

    }


    const maximo =
      5 * 1024 * 1024;


    if (
      archivo.size > maximo
    ) {

      this.errorImagen =
        'La imagen no puede superar los 5 MB.';

      input.value = '';

      return;

    }


    this.archivoImagen =
      archivo;


    if (
      this.previewImagen &&
      this.previewImagen.startsWith(
        'blob:'
      )
    ) {

      URL.revokeObjectURL(
        this.previewImagen
      );

    }


    this.previewImagen =
      URL.createObjectURL(
        archivo
      );

  }


  // =========================================================
  // QUITAR IMAGEN SELECCIONADA
  // =========================================================

  cancelarImagen(): void {

    if (
      this.previewImagen &&
      this.previewImagen.startsWith(
        'blob:'
      )
    ) {

      URL.revokeObjectURL(
        this.previewImagen
      );

    }


    this.archivoImagen = null;

    this.previewImagen = null;

    this.errorImagen = '';

  }


  // =========================================================
  // URL DE IMAGEN
  // =========================================================

  imagenActualUrl(): string | null {

    if (this.previewImagen) {

      return this.previewImagen;

    }


    if (this.imagen) {

      return (
        this.uploadsUrl +
        this.imagen
      );

    }


    return null;

  }


  // =========================================================
  // GUARDAR
  // =========================================================

  guardar(): void {

    this.error = '';

    this.errorImagen = '';


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
      this.precioOferta != null &&
      this.precioOferta < 0
    ) {

      this.error =
        'El precio de oferta no puede ser negativo.';

      return;

    }


    if (
      this.precioOferta != null &&
      this.precioOferta >= this.precio
    ) {

      this.error =
        'El precio de oferta debe ser menor al precio normal.';

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


    this.guardando = true;


    // Si seleccionó una imagen nueva,
    // primero la subimos.
    if (this.archivoImagen) {

      this.subirImagenYGuardar();

      return;

    }


    // Si no seleccionó una imagen nueva,
    // guardamos con la imagen existente.
    this.guardarProducto();

  }


  // =========================================================
  // SUBIR IMAGEN
  // =========================================================

  private subirImagenYGuardar(): void {

    if (!this.archivoImagen) {

      this.guardarProducto();

      return;

    }


    this.subiendoImagen = true;


    this.imagenService
      .subirProducto(
        this.archivoImagen
      )
      .subscribe({

        next: nombreArchivo => {

          this.imagen =
            nombreArchivo.trim();

          this.subiendoImagen = false;

          this.guardarProducto();

        },


        error: error => {

          console.error(
            'Error subiendo imagen:',
            error
          );

          this.errorImagen =
            'No se pudo subir la imagen.';

          this.subiendoImagen = false;

          this.guardando = false;

        }

      });

  }


  // =========================================================
  // CREAR / ACTUALIZAR PRODUCTO
  // =========================================================

  private guardarProducto(): void {

    if (
      !this.idGenero ||
      !this.idCategoria
    ) {

      this.guardando = false;

      return;

    }


    const producto:
      Partial<Producto> = {

      nombre:
        this.nombre.trim(),

      descripcion:
        this.descripcion.trim(),

      precio:
        Number(this.precio),

      precioOferta:
        this.precioOferta
          ? Number(this.precioOferta)
          : null,

      imagen:
        this.imagen,

      nuevo:
        this.nuevo,

      destacado:
        this.destacado,

      estado:
        this.estado

    };


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
              'No se pudo actualizar el producto.';

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