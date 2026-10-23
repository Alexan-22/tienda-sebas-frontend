import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { GoogleSigninButtonModule, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    GoogleSigninButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  correo = '';
  password = '';
  mostrarPassword = false;
  cargando = false;
  error = '';
  registroExitoso = false;
  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');

    if (url && url.startsWith('/') && !url.startsWith('//')) {
      this.returnUrl = url;
    }

    this.registroExitoso =
      this.route.snapshot.queryParamMap.get('registrado') === 'true';
  }

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.procesarLoginGoogle(user.idToken);
      }
    });
  }

  iniciarSesion(): void {
    this.error = '';

    if (!this.correo.trim() || !this.password) {
      this.error = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.cargando = true;

    this.authService
      .login({
        correo: this.correo.trim().toLowerCase(),
        password: this.password
      })
      .subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          console.error('Error login:', error);
          this.cargando = false;

          if (typeof error.error === 'string') {
            this.error = error.error;
          } else {
            this.error = 'Correo o contraseña incorrectos.';
          }
        }
      });
  }

  procesarLoginGoogle(idToken: string): void {
    this.cargando = true;
    this.error = '';

    this.authService.loginConGoogle(idToken).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        console.error('Error al iniciar sesión con Google:', err);
        this.cargando = false;
        this.error = 'No se pudo iniciar sesión con Google.';
      }
    });
  }
}