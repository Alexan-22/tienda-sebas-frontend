import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Venta, DetalleVenta } from '../../../core/models/venta-detalle';
import { Producto } from '../../../core/models/producto';
import { ProductoTalla } from '../../../core/models/producto-talla';
import { UsuarioAdmin } from '../../../core/models/usuario-admin';

import { VentaService } from '../../../core/services/venta';
import { ProductoService } from '../../../core/services/producto';
import { ProductoTallaService } from '../../../core/services/producto-talla';
import { UsuarioService } from '../../../core/services/usuario';

interface ProductoVendido {
  idProducto: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  ingresos: number;
  porcentaje: number;
}

interface MedioPagoReporte {
  nombre: string;
  cantidad: number;
  total: number;
  porcentaje: number;
}

interface CategoriaReporte {
  nombre: string;
  cantidad: number;
  ingresos: number;
  porcentaje: number;
}

interface CanalReporte {
  nombre: 'ONLINE' | 'PRESENCIAL';
  cantidad: number;
  total: number;
  porcentaje: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  // DATOS PRINCIPALES
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  productos: Producto[] = [];
  usuarios: UsuarioAdmin[] = [];
  detalles: DetalleVenta[] = [];
  inventario: ProductoTalla[] = [];

  // FILTROS
  periodo = 'TODO';
  canal = 'TODOS';

  // ESTADO
  cargando = true;
  error = '';

  // RESULTADOS
  productosVendidos: ProductoVendido[] = [];
  mediosPago: MedioPagoReporte[] = [];
  categorias: CategoriaReporte[] = [];
  canales: CanalReporte[] = [];

  constructor(
    private ventaService: VentaService,
    private productoService: ProductoService,
    private productoTallaService: ProductoTallaService,
    private usuarioService: UsuarioService
  ) {}

  // INICIO
  ngOnInit(): void {
    this.cargarReportes();
  }

  // CARGA PRINCIPAL
  cargarReportes(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      ventas: this.ventaService.listarTodas().pipe(
        catchError(error => {
          console.error('Error cargando ventas:', error);
          return of([] as Venta[]);
        })
      ),
      productos: this.productoService.listar().pipe(
        catchError(error => {
          console.error('Error cargando productos:', error);
          return of([] as Producto[]);
        })
      ),
      usuarios: this.usuarioService.listarTodos().pipe(
        catchError(error => {
          console.error('Error cargando usuarios:', error);
          return of([] as UsuarioAdmin[]);
        })
      )
    }).subscribe({
      next: respuesta => {
        this.ventas = respuesta.ventas ?? [];
        this.productos = respuesta.productos ?? [];
        this.usuarios = respuesta.usuarios ?? [];
        this.cargarInformacionSecundaria();
      },
      error: error => {
        console.error('Error cargando reportes:', error);
        this.error = 'No se pudo cargar la información de reportes.';
        this.cargando = false;
      }
    });
  }

  // DETALLES + INVENTARIO
  private cargarInformacionSecundaria(): void {
    // Los detalles administrativos se obtienen mediante una sola petición.
    const detalles$ = this.ventaService.listarDetallesParaReportes().pipe(
      catchError(error => {
        console.error('Error cargando detalles para reportes:', error);
        return of([] as DetalleVenta[]);
      })
    );

    // El inventario todavía se consulta por producto.
    const consultasStock = this.productos.map(producto =>
      this.productoTallaService.listarPorProducto(producto.idProducto).pipe(
        catchError(error => {
          console.error(`Error stock producto ${producto.idProducto}:`, error);
          return of([] as ProductoTalla[]);
        })
      )
    );

    const stock$ = consultasStock.length > 0 ? forkJoin(consultasStock) : of([] as ProductoTalla[][]);

    forkJoin({ detalles: detalles$, stock: stock$ }).subscribe({
      next: respuesta => {
        this.detalles = respuesta.detalles ?? [];
        this.inventario = respuesta.stock.flat();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: error => {
        console.error('Error cargando información secundaria:', error);
        this.error = 'No se pudo completar la información de reportes.';
        this.cargando = false;
      }
    });
  }

  // FILTROS
  aplicarPeriodo(): void {
    this.aplicarFiltros();
  }

  aplicarCanal(): void {
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    const ahora = new Date();

    this.ventasFiltradas = this.ventas.filter(venta => {
      const fecha = new Date(venta.fechaVenta);
      let cumplePeriodo = true;

      if (this.periodo === '7') {
        const limite = new Date();
        limite.setDate(ahora.getDate() - 7);
        cumplePeriodo = fecha >= limite;
      } else if (this.periodo === '30') {
        const limite = new Date();
        limite.setDate(ahora.getDate() - 30);
        cumplePeriodo = fecha >= limite;
      } else if (this.periodo === 'MES') {
        cumplePeriodo = fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      }

      const tipoVenta = this.obtenerTipoVenta(venta);
      const cumpleCanal = this.canal === 'TODOS' || tipoVenta === this.canal;

      return cumplePeriodo && cumpleCanal;
    });

    this.generarProductosVendidos();
    this.generarMediosPago();
    this.generarCategorias();
    this.generarCanales();
  }

  private obtenerTipoVenta(venta: Venta): 'ONLINE' | 'PRESENCIAL' {
    if (venta.tipoVenta === 'PRESENCIAL') return 'PRESENCIAL';
    if (venta.tipoVenta === 'ONLINE') return 'ONLINE';
    return venta.idClientePresencial ? 'PRESENCIAL' : 'ONLINE';
  }

  // DETALLES DEL FILTRO
  private idsVentasFiltradas(): Set<number> {
    return new Set(this.ventasFiltradas.map(venta => venta.idVenta));
  }

  private detallesPeriodo(): DetalleVenta[] {
    const ids = this.idsVentasFiltradas();
    return this.detalles.filter(detalle => {
      const idVenta = this.obtenerIdVentaDetalle(detalle);
      if (idVenta === null) return this.periodo === 'TODO' && this.canal === 'TODOS';
      return ids.has(idVenta);
    });
  }

  private obtenerIdVentaDetalle(detalle: DetalleVenta): number | null {
    return detalle.idVenta ?? null;
  }

  // PRODUCTOS MÁS VENDIDOS
  private generarProductosVendidos(): void {
    const mapa = new Map<number, ProductoVendido>();

    for (const detalle of this.detallesPeriodo()) {
      const producto = detalle.productoTalla?.producto;
      if (!producto) continue;

      const id = producto.idProducto;
      const actual = mapa.get(id);

      if (actual) {
        actual.cantidad += Number(detalle.cantidad ?? 0);
        actual.ingresos += Number(detalle.subtotal ?? 0);
      } else {
        mapa.set(id, {
          idProducto: id,
          nombre: producto.nombre,
          categoria: producto.categoria?.nombreCategoria ?? 'Sin categoría',
          cantidad: Number(detalle.cantidad ?? 0),
          ingresos: Number(detalle.subtotal ?? 0),
          porcentaje: 0
        });
      }
    }

    const resultado = Array.from(mapa.values()).sort((a, b) => b.cantidad - a.cantidad);
    const maximo = resultado.length > 0 ? resultado[0].cantidad : 0;

    resultado.forEach(producto => {
      producto.porcentaje = maximo > 0 ? (producto.cantidad / maximo) * 100 : 0;
    });

    this.productosVendidos = resultado;
  }

  // MEDIOS DE PAGO
  private generarMediosPago(): void {
    const mapa = new Map<string, MedioPagoReporte>();

    for (const venta of this.ventasFiltradas) {
      const nombre = venta.medioPago || 'OTRO';
      const actual = mapa.get(nombre);

      if (actual) {
        actual.cantidad++;
        actual.total += Number(venta.total ?? 0);
      } else {
        mapa.set(nombre, {
          nombre,
          cantidad: 1,
          total: Number(venta.total ?? 0),
          porcentaje: 0
        });
      }
    }

    const total = this.ventasFiltradas.length;

    this.mediosPago = Array.from(mapa.values())
      .map(item => ({ ...item, porcentaje: total > 0 ? (item.cantidad / total) * 100 : 0 }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  // VENTAS POR CANAL
  private generarCanales(): void {
    const mapa = new Map<'ONLINE' | 'PRESENCIAL', CanalReporte>();

    for (const venta of this.ventasFiltradas) {
      const nombre = this.obtenerTipoVenta(venta);
      const actual = mapa.get(nombre);

      if (actual) {
        actual.cantidad++;
        actual.total += Number(venta.total ?? 0);
      } else {
        mapa.set(nombre, {
          nombre,
          cantidad: 1,
          total: Number(venta.total ?? 0),
          porcentaje: 0
        });
      }
    }

    const total = this.ventasFiltradas.length;

    this.canales = Array.from(mapa.values())
      .map(item => ({ ...item, porcentaje: total > 0 ? (item.cantidad / total) * 100 : 0 }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  // VENTAS POR CATEGORÍA
  private generarCategorias(): void {
    const mapa = new Map<string, CategoriaReporte>();

    for (const detalle of this.detallesPeriodo()) {
      const categoria = detalle.productoTalla?.producto?.categoria?.nombreCategoria ?? 'Sin categoría';
      const actual = mapa.get(categoria);

      if (actual) {
        actual.cantidad += Number(detalle.cantidad ?? 0);
        actual.ingresos += Number(detalle.subtotal ?? 0);
      } else {
        mapa.set(categoria, {
          nombre: categoria,
          cantidad: Number(detalle.cantidad ?? 0),
          ingresos: Number(detalle.subtotal ?? 0),
          porcentaje: 0
        });
      }
    }

    const resultado = Array.from(mapa.values()).sort((a, b) => b.cantidad - a.cantidad);
    const maximo = resultado.length > 0 ? resultado[0].cantidad : 0;

    resultado.forEach(categoria => {
      categoria.porcentaje = maximo > 0 ? (categoria.cantidad / maximo) * 100 : 0;
    });

    this.categorias = resultado;
  }

  // INDICADORES DE VENTAS
  get totalVentas(): number {
    return this.ventasFiltradas.length;
  }

  get ingresosTotales(): number {
    return this.ventasFiltradas.reduce((total, venta) => total + Number(venta.total ?? 0), 0);
  }

  get ventaPromedio(): number {
    return this.totalVentas > 0 ? this.ingresosTotales / this.totalVentas : 0;
  }

  get unidadesVendidas(): number {
    return this.detallesPeriodo().reduce((total, detalle) => total + Number(detalle.cantidad ?? 0), 0);
  }

  get ventasOnline(): number {
    return this.ventasFiltradas.filter(venta => this.obtenerTipoVenta(venta) === 'ONLINE').length;
  }

  get ventasPresenciales(): number {
    return this.ventasFiltradas.filter(venta => this.obtenerTipoVenta(venta) === 'PRESENCIAL').length;
  }

  // INDICADORES DE USUARIOS
  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get usuariosActivos(): number {
    return this.usuarios.filter(usuario => usuario.estado).length;
  }

  get totalClientes(): number {
    return this.usuarios.filter(usuario => usuario.rol?.toUpperCase() === 'CLIENTE').length;
  }

  // INDICADORES DE INVENTARIO
  get stockTotal(): number {
    return this.inventario.reduce((total, item) => total + Number(item.stock ?? 0), 0);
  }

  get stockBajo(): number {
    return this.inventario.filter(item => item.stock > 0 && item.stock <= 5).length;
  }

  get sinStock(): number {
    return this.inventario.filter(item => item.stock <= 0).length;
  }

  get productosActivos(): number {
    return this.productos.filter(producto => producto.estado).length;
  }

  // PRODUCTO LÍDER
  get productoMasVendido(): ProductoVendido | null {
    return this.productosVendidos.length > 0 ? this.productosVendidos[0] : null;
  }
}