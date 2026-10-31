import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TiendaService } from './core/services/tienda.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  private tiendaService = inject(TiendaService);

  ngOnInit(): void {
    this.tiendaService.cargarConfiguracion().subscribe();
  }
}

export { AppComponent as App };
