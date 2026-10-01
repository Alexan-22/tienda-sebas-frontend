import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductoService } from '../../../core/services/producto';
import { ProductoTallaService } from '../../../core/services/producto-talla';
import { VentaService } from '../../../core/services/venta';
import { UsuarioService } from '../../../core/services/usuario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  totalProductos: number | null = null;
  totalVentas: number | null = null;
  totalClientes: number | null = null;
  totalStock: number | null = null;

  constructor(
    private productoService: ProductoService,
    private productoTallaService: ProductoTallaService,
    private ventaService: VentaService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarVentas();
    this.cargarUsuarios();
  }

  // ==========================================
  // PRODUCTOS
  // ==========================================
  private cargarProductos(): void {
    this.productoService.listar().subscribe({
      next: productos => {
        this.totalProductos = productos.length;

        // Una vez tenemos los productos,
        // calculamos el stock.
        if (productos.length === 0) {
          this.totalStock = 0;
          this.actualizarVista();
          return;
        }

        const consultasStock = productos.map(producto =>
          this.productoTallaService.listarPorProducto(producto.idProducto).pipe(
            catchError(() => of([]))
          )
        );

        forkJoin(consultasStock).subscribe({
          next: resultados => {
            this.totalStock = resultados.reduce((totalGeneral, tallas) => {
              const stockProducto = tallas.reduce((total, productoTalla) =>
                total + Number(productoTalla.stock || 0), 0
              );
              return totalGeneral + stockProducto;
            }, 0);

            this.actualizarVista();
          },
          error: error => {
            console.error('Error calculando stock:', error);
            this.totalStock = 0;
            this.actualizarVista();
          }
        });

        this.actualizarVista();
      },
      error: error => {
        console.error('Error cargando productos:', error);
        this.totalProductos = 0;
        this.totalStock = 0;
        this.actualizarVista();
      }
    });
  }

  // ==========================================
  // VENTAS
  // ==========================================
  private cargarVentas(): void {
    this.ventaService.listarTodas().subscribe({
      next: ventas => {
        this.totalVentas = ventas.length;
        this.actualizarVista();
      },
      error: error => {
        console.error('Error cargando ventas:', error);
        this.totalVentas = 0;
        this.actualizarVista();
      }
    });
  }

  // ==========================================
  // USUARIOS
  // ==========================================
  private cargarUsuarios(): void {
    this.usuarioService.listarTodos().subscribe({
      next: usuarios => {
        this.totalClientes = usuarios.filter(usuario =>
          usuario.rol?.toUpperCase() === 'CLIENTE'
        ).length;

        this.actualizarVista();
      },
      error: error => {
        console.error('Error cargando usuarios:', error);
        this.totalClientes = 0;
        this.actualizarVista();
      }
    });
  }

  // ==========================================
  // ACTUALIZAR VISTA
  // ==========================================
  private actualizarVista(): void {
    this.cdr.detectChanges();
  }
}