import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CarritoService } from '../../../core/services/carrito';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  menuAbierto = false;

  constructor(
    public carritoService: CarritoService,
    public authService: AuthService,
    private router: Router
  ) {}

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  irACuenta(): void {

    this.cerrarMenu();

    if (this.authService.autenticado()) {
      this.router.navigate(['/mis-compras']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion(): void {

    this.authService.logout();

    this.cerrarMenu();

    this.router.navigate(['/']);
  }
}