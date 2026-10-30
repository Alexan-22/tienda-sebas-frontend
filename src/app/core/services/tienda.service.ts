import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, of } from 'rxjs';

export interface TiendaConfig {
  id: number;
  nombre: String;
  subdominio: String;
  colorPrimario: String;
  logoUrl: String;
  ruc?: String;
  telefonoSoporte?: String;
}

@Injectable({
  providedIn: 'root'
})
export class TiendaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/tiendas`;

  // Signal para almacenar el estado dinámico de la tienda activa
  public tiendaActual = signal<TiendaConfig | null>(null);

  cargarConfiguracion(): Observable<TiendaConfig> {
    const domain = window.location.hostname;
    
    return this.http.get<TiendaConfig>(`${this.apiUrl}/config?domain=${domain}`).pipe(
      tap((config) => {
        this.tiendaActual.set(config);
        this.aplicarTema(config.colorPrimario);
      }),
      catchError((err) => {
        console.error('Error cargando configuración de la tienda:', err);
        // Fallback predeterminado a Sebas Collection (1)
        const defaultConfig: TiendaConfig = {
          id: 1,
          nombre: 'Sebas Collection',
          subdominio: 'sebascollection',
          colorPrimario: '#000000',
          logoUrl: '/images/home/publiclogo-tienda.jpg.jpg'
        };
        this.tiendaActual.set(defaultConfig);
        this.aplicarTema(defaultConfig.colorPrimario);
        return of(defaultConfig);
      })
    );
  }

  private aplicarTema(colorHex: String): void {
    if (colorHex) {
      document.documentElement.style.setProperty('--color-primario', `${colorHex}`);
    }
  }
}