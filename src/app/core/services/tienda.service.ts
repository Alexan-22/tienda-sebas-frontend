import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConfiguracionTienda {
  id: number;
  nombre: string;
  logoUrl: string;
  colorPrimario: string;
}

@Injectable({
  providedIn: 'root'
})
export class TiendaService {
  tiendaActual = signal<ConfiguracionTienda | null>(null);

  constructor(private http: HttpClient) {}

  cargarConfiguracion(): Observable<ConfiguracionTienda> {
    const domain = window.location.hostname;
    return this.http.get<ConfiguracionTienda>(`${environment.apiUrl}/api/v1/tiendas/config?domain=${domain}`).pipe(
      tap(config => {
        this.tiendaActual.set(config);
        // Actualizar el título de la pestaña del navegador
        document.title = config.nombre;
        // Aplicar el color primario como variable CSS
        document.documentElement.style.setProperty('--color-primario', config.colorPrimario);
      })
    );
  }
}