import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ProductoService } from '../../core/services/producto';
import { HomeContenidoService } from '../../core/services/home-contenido';
import { TiendaService } from '../../core/services/tienda.service';
import { Producto } from '../../core/models/producto';
import { HomeBanner, HomeColeccion } from '../../core/models/home-contenido';
import { PromoBar } from '../../shared/components/promo-bar/promo-bar';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PromoBar, Navbar, Footer, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  readonly uploadsUrl = `${environment.apiUrl}/uploads/`;
  productos: Producto[] = [];
  cargando = true;
  errorCarga = false;
  banners: HomeBanner[] = [];
  bannerActual = 0;
  cargandoBanners = true;
  errorBanners = false;
  colecciones: HomeColeccion[] = [];
  cargandoColecciones = true;
  errorColecciones = false;
  private intervaloCarrusel: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly productosService: ProductoService,
    private readonly homeService: HomeContenidoService,
    public readonly tiendaService: TiendaService
  ) {}

  ngOnInit(): void { this.cargarProductos(); this.cargarBanners(); this.cargarColecciones(); }
  ngOnDestroy(): void { this.detenerCarrusel(); }

  cargarProductos(): void {
    this.cargando = true;
    this.errorCarga = false;
    this.productosService.listar().subscribe({
      next: productos => { this.productos = (productos ?? []).slice(0, 8); this.cargando = false; },
      error: error => { console.error('Productos:', error); this.errorCarga = true; this.cargando = false; }
    });
  }
  cargarBanners(): void {
    this.cargandoBanners = true;
    this.errorBanners = false;
    this.homeService.listarBannersPublicos().subscribe({
      next: banners => {
        this.banners = [...(banners ?? [])].sort((a, b) => a.orden - b.orden);
        this.bannerActual = 0;
        this.cargandoBanners = false;
        if (this.banners.length > 1) this.iniciarCarrusel();
      },
      error: error => { console.error('Banners:', error); this.errorBanners = true; this.cargandoBanners = false; }
    });
  }
  cargarColecciones(): void {
    this.cargandoColecciones = true;
    this.errorColecciones = false;
    this.homeService.listarColeccionesPublicas().subscribe({
      next: colecciones => {
        this.colecciones = [...(colecciones ?? [])].sort((a, b) => a.orden - b.orden);
        this.cargandoColecciones = false;
      },
      error: error => { console.error('Colecciones:', error); this.errorColecciones = true; this.cargandoColecciones = false; }
    });
  }
  obtenerBannerActual(): HomeBanner | null { return this.banners[this.bannerActual] ?? null; }
  siguienteBanner(): void { this.moverBanner(1); }
  bannerAnterior(): void { this.moverBanner(-1); }
  private moverBanner(direccion: number): void {
    if (this.banners.length < 2) return;
    this.bannerActual = (this.bannerActual + direccion + this.banners.length) % this.banners.length;
    this.iniciarCarrusel();
  }
  irABanner(indice: number): void {
    if (indice < 0 || indice >= this.banners.length) return;
    this.bannerActual = indice;
    this.iniciarCarrusel();
  }
  private iniciarCarrusel(): void {
    this.detenerCarrusel();
    if (this.banners.length > 1) {
      this.intervaloCarrusel = setInterval(() => {
        this.bannerActual = (this.bannerActual + 1) % this.banners.length;
      }, 6500);
    }
  }
  private detenerCarrusel(): void {
    if (this.intervaloCarrusel) clearInterval(this.intervaloCarrusel);
    this.intervaloCarrusel = null;
  }
  imagenBannerUrl(b: HomeBanner): string | null { return b.imagen ? this.uploadsUrl + b.imagen : null; }
  imagenColeccionUrl(c: HomeColeccion): string | null { return c.imagen ? this.uploadsUrl + c.imagen : null; }
  enlaceBanner(b: HomeBanner): string { return this.enlaceSeguro(b.enlaceBoton); }
  enlaceColeccion(c: HomeColeccion): string { return this.enlaceSeguro(c.enlace); }
  private enlaceSeguro(ruta?: string | null): string {
    if (!ruta || !ruta.startsWith('/') || ruta.startsWith('//') || ruta.includes('\\')) return '/tienda';
    return ruta;
  }
  get productosMujer(): Producto[] { return this.productos.filter(p => p.genero?.idGenero === 2).slice(0, 4); }
  get productosHombre(): Producto[] { return this.productos.filter(p => p.genero?.idGenero === 1).slice(0, 4); }
}
