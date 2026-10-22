import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from '../../../core/services/carrito';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuAbierto = false;
  cuentaAbierta = false;

  constructor(
    public carritoService: CarritoService,
    public authService: AuthService,
    private router: Router
  ) {}

  // ==========================================
  // BÚSQUEDA DE PRODUCTOS
  // ==========================================
  ejecutarBusqueda(termino: string): void {
    const query = termino.trim();
    if (query.length > 0) {
      this.cerrarMenu();
      this.router.navigate(['/tienda'], { queryParams: { q: query } });
    }
  }

  // ==========================================
  // MENÚ MÓVIL
  // ==========================================
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    this.cuentaAbierta = false;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  // ==========================================
  // MENÚ DE CUENTA
  // ==========================================
  toggleCuenta(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.authService.autenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cuentaAbierta = !this.cuentaAbierta;
    this.menuAbierto = false;
  }

  cerrarCuenta(): void {
    this.cuentaAbierta = false;
  }

  @HostListener('document:click')
  cerrarCuentaAlHacerClickFuera(): void {
    this.cuentaAbierta = false;
  }

  // ==========================================
  // DATOS DEL USUARIO
  // ==========================================
  get correoUsuario(): string {
    return this.authService.obtenerCorreo() ?? 'Mi cuenta';
  }

  get inicialUsuario(): string {
    const correo = this.authService.obtenerCorreo();

    if (!correo) {
      return 'U';
    }

    return correo.charAt(0).toUpperCase();
  }

  get rolUsuario(): string {
    const rol = this.authService.obtenerRol();

    if (!rol) {
      return 'CLIENTE';
    }

    return rol.toUpperCase();
  }

  get esAdmin(): boolean {
    return this.rolUsuario === 'ADMIN';
  }

  // ==========================================
  // NAVEGACIÓN DE CUENTA
  // ==========================================
  irACuenta(): void {
    this.cerrarMenu();
    this.cerrarCuenta();

    if (!this.authService.autenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.esAdmin) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.router.navigate(['/mis-compras']);
  }

  irAMisCompras(): void {
    this.cerrarCuenta();
    this.cerrarMenu();
    this.router.navigate(['/mis-compras']);
  }

  irAAdmin(): void {
    this.cerrarCuenta();
    this.cerrarMenu();
    this.router.navigate(['/admin/dashboard']);
  }

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================
  cerrarSesion(): void {
    this.authService.logout();
    this.cerrarCuenta();
    this.cerrarMenu();
    this.router.navigate(['/']);
  }
}