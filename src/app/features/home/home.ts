import { environment } from '../../../environments/environment';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductoService } from '../../core/services/producto';
import { HomeContenidoService } from '../../core/services/home-contenido';
import { Producto } from '../../core/models/producto';
import { HomeBanner, HomeColeccion } from '../../core/models/home-contenido';
import { PromoBar } from '../../shared/components/promo-bar/promo-bar';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PromoBar, Navbar, Footer, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  private readonly uploadsUrl = `${environment.apiUrl}/uploads/`;

  // =========================================================
  // PRODUCTOS
  // =========================================================

  productos: Producto[] = [];
  cargando = true;
  errorCarga = false;

  // =========================================================
  // BANNERS
  // =========================================================

  banners: HomeBanner[] = [];
  bannerActual = 0;
  cargandoBanners = true;
  errorBanners = false;

  private intervaloCarrusel: ReturnType<typeof setInterval> | null = null;
  private readonly tiempoCarrusel = 3000;

  // =========================================================
  // COLECCIONES
  // =========================================================

  colecciones: HomeColeccion[] = [];
  cargandoColecciones = true;
  errorColecciones = false;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private productoService: ProductoService,
    private homeContenidoService: HomeContenidoService
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarBanners();
    this.cargarColecciones();
  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {
    this.detenerCarrusel();
  }

  // =========================================================
  // PRODUCTOS
  // =========================================================

  cargarProductos(): void {
    this.cargando = true;
    this.errorCarga = false;

    this.productoService.listar().subscribe({
      next: (productos: Producto[]) => {
        console.log('Productos recibidos:', productos);
        this.productos = productos.slice(0, 8);
        this.cargando = false;
      },
      error: error => {
        console.error('Error cargando productos:', error);
        this.productos = [];
        this.errorCarga = true;
        this.cargando = false;
      }
    });
  }

  // =========================================================
  // CARGAR BANNERS
  // =========================================================

  cargarBanners(): void {
    this.cargandoBanners = true;
    this.errorBanners = false;

    this.homeContenidoService.listarBannersPublicos().subscribe({
      next: (banners: HomeBanner[]) => {
        this.banners = [...banners].sort((a, b) => a.orden - b.orden);
        this.bannerActual = 0;
        this.cargandoBanners = false;

        if (this.banners.length > 1) {
          this.iniciarCarrusel();
        }
      },
      error: error => {
        console.error('Error cargando banners:', error);
        this.banners = [];
        this.errorBanners = true;
        this.cargandoBanners = false;
      }
    });
  }

  // =========================================================
  // CARGAR COLECCIONES
  // =========================================================

  cargarColecciones(): void {
    this.cargandoColecciones = true;
    this.errorColecciones = false;

    this.homeContenidoService.listarColeccionesPublicas().subscribe({
      next: (colecciones: HomeColeccion[]) => {
        this.colecciones = [...colecciones].sort((a, b) => a.orden - b.orden);
        this.cargandoColecciones = false;
      },
      error: error => {
        console.error('Error cargando colecciones:', error);
        this.colecciones = [];
        this.errorColecciones = true;
        this.cargandoColecciones = false;
      }
    });
  }

  // =========================================================
  // BANNER ACTIVO
  // =========================================================

  obtenerBannerActual(): HomeBanner | null {
    if (this.banners.length === 0) {
      return null;
    }

    return this.banners[this.bannerActual] ?? null;
  }

  // =========================================================
  // SIGUIENTE BANNER
  // =========================================================

  siguienteBanner(): void {
    if (this.banners.length <= 1) {
      return;
    }

    this.bannerActual = (this.bannerActual + 1) % this.banners.length;
    this.reiniciarCarrusel();
  }

  // =========================================================
  // BANNER ANTERIOR
  // =========================================================

  bannerAnterior(): void {
    if (this.banners.length <= 1) {
      return;
    }

    this.bannerActual = (this.bannerActual - 1 + this.banners.length) % this.banners.length;
    this.reiniciarCarrusel();
  }

  // =========================================================
  // IR A BANNER
  // =========================================================

  irABanner(indice: number): void {
    if (indice < 0 || indice >= this.banners.length) {
      return;
    }

    this.bannerActual = indice;
    this.reiniciarCarrusel();
  }

  // =========================================================
  // INICIAR CARRUSEL
  // =========================================================

  private iniciarCarrusel(): void {
    this.detenerCarrusel();

    if (this.banners.length <= 1) {
      return;
    }

    this.intervaloCarrusel = setInterval(() => {
      this.bannerActual = (this.bannerActual + 1) % this.banners.length;
    }, this.tiempoCarrusel);
  }

  // =========================================================
  // REINICIAR CARRUSEL
  // =========================================================

  private reiniciarCarrusel(): void {
    if (this.banners.length <= 1) {
      return;
    }

    this.iniciarCarrusel();
  }

  // =========================================================
  // DETENER CARRUSEL
  // =========================================================

  private detenerCarrusel(): void {
    if (this.intervaloCarrusel) {
      clearInterval(this.intervaloCarrusel);
      this.intervaloCarrusel = null;
    }
  }

  // =========================================================
  // URL IMAGEN BANNER
  // =========================================================

  imagenBannerUrl(banner: HomeBanner): string | null {
    if (!banner.imagen) {
      return null;
    }

    return this.uploadsUrl + banner.imagen;
  }

  // =========================================================
  // URL IMAGEN COLECCIÓN
  // =========================================================

  imagenColeccionUrl(coleccion: HomeColeccion): string | null {
    if (!coleccion.imagen) {
      return null;
    }

    return this.uploadsUrl + coleccion.imagen;
  }

  // =========================================================
  // ENLACE BANNER
  // =========================================================

  enlaceBanner(banner: HomeBanner): string {
    if (!banner.enlaceBoton || !banner.enlaceBoton.trim()) {
      return '#productos';
    }

    return banner.enlaceBoton;
  }

  // =========================================================
  // ENLACE COLECCIÓN
  // =========================================================

  enlaceColeccion(coleccion: HomeColeccion): string {
    if (!coleccion.enlace || !coleccion.enlace.trim()) {
      return '#productos';
    }

    return coleccion.enlace;
  }
}