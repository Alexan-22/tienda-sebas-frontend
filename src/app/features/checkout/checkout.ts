import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CarritoService } from '../../core/services/carrito';
import { VentaService } from '../../core/services/venta';
import { ProductoTallaService } from '../../core/services/producto-talla';
import { CompraRequest, CompraResponse } from '../../core/models/venta';
import { DatosCheckout, MetodoPago } from '../../core/models/checkout';
import { ProductoTalla } from '../../core/models/producto-talla';
import { PromoBar } from '../../shared/components/promo-bar/promo-bar';
import { Navbar } from '../../shared/components/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, PromoBar, Navbar, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  readonly items;
  readonly subtotal;

  readonly departamentos = [
    'Amazonas',
    'Áncash',
    'Apurímac',
    'Arequipa',
    'Ayacucho',
    'Cajamarca',
    'Callao',
    'Cusco',
    'Huancavelica',
    'Huánuco',
    'Ica',
    'Junín',
    'La Libertad',
    'Lambayeque',
    'Lima',
    'Loreto',
    'Madre de Dios',
    'Moquegua',
    'Pasco',
    'Piura',
    'Puno',
    'San Martín',
    'Tacna',
    'Tumbes',
    'Ucayali'
  ];

  readonly numeroYape = '960 739 587';
  readonly qrYape = '/images/home/yape-qr.jpeg';
  readonly whatsappUrl = 'https://wa.me/51935421403?text=Hola%2C%20tengo%20una%20consulta%20sobre%20mi%20pedido.';

  procesando = false;
  error = '';
  pagoYapeConfirmado = false;
  aceptaTerminos = false;

  // Formulario visual de tarjeta. No se envía ni almacena en el backend.
  numeroTarjeta = '';
  titularTarjeta = '';
  vencimientoTarjeta = '';
  cvvTarjeta = '';

  datos: DatosCheckout = {
    nombres: '',
    apellidos: '',
    telefono: '',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: '',
    direccion: '',
    referencia: '',
    metodoPago: 'YAPE'
  };

  constructor(
    public carritoService: CarritoService,
    private ventaService: VentaService,
    private productoTallaService: ProductoTallaService,
    private router: Router
  ) {
    this.items = carritoService.items;
    this.subtotal = carritoService.subtotal;

    if (this.items().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  // =========================================================
  // DATOS DE ENTREGA
  // =========================================================

  normalizarTelefono(): void {
    this.datos.telefono = this.datos.telefono.replace(/\D/g, '').slice(0, 9);
  }

  cambiarDepartamento(): void {
    this.datos.provincia = '';
    this.datos.distrito = '';
  }

  // =========================================================
  // FORMULARIO VISUAL DE TARJETA
  // =========================================================

  normalizarNumeroTarjeta(): void {
    const numeros = this.numeroTarjeta.replace(/\D/g, '').slice(0, 16);
    this.numeroTarjeta = numeros.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  normalizarVencimiento(): void {
    const numeros = this.vencimientoTarjeta.replace(/\D/g, '').slice(0, 4);

    if (numeros.length <= 2) {
      this.vencimientoTarjeta = numeros;
      return;
    }

    this.vencimientoTarjeta = `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  normalizarCvv(): void {
    this.cvvTarjeta = this.cvvTarjeta.replace(/\D/g, '').slice(0, 4);
  }

  // =========================================================
  // DELIVERY ESTIMADO
  // =========================================================

  get costoDeliveryEstimado(): number {
    const departamento = this.normalizarTexto(this.datos.departamento);
    const provincia = this.normalizarTexto(this.datos.provincia);

    if (!departamento || !provincia) {
      return 0;
    }

    if (departamento === 'lima' && provincia === 'lima') {
      return 10;
    }

    return 20;
  }

  get totalEstimado(): number {
    return this.subtotal() + this.costoDeliveryEstimado;
  }

  // =========================================================
  // MÉTODO DE PAGO
  // =========================================================

  seleccionarPago(metodo: MetodoPago): void {
    this.datos.metodoPago = metodo;
    this.error = '';

    if (metodo !== 'YAPE') {
      this.pagoYapeConfirmado = false;
    }
  }

  continuarPago(): void {
    this.error = '';

    if (
      !this.datos.nombres.trim() ||
      !this.datos.apellidos.trim() ||
      !this.datos.telefono.trim() ||
      !this.datos.departamento.trim() ||
      !this.datos.provincia.trim() ||
      !this.datos.distrito.trim() ||
      !this.datos.direccion.trim()
    ) {
      this.error = 'Completa los datos obligatorios de entrega.';
      return;
    }

    if (!/^9\d{8}$/.test(this.datos.telefono.trim())) {
      this.error = 'Ingresa un celular peruano válido de 9 dígitos.';
      return;
    }

    if (this.datos.metodoPago === 'YAPE' && !this.pagoYapeConfirmado) {
      this.error = 'Confirma que realizaste el pago mediante Yape.';
      return;
    }

    if (this.datos.metodoPago === 'TARJETA' && !this.validarTarjetaDemo()) {
      return;
    }

    if (!this.aceptaTerminos) {
      this.error = 'Debes aceptar los términos y condiciones para continuar.';
      return;
    }

    if (this.items().length === 0) {
      this.error = 'El carrito está vacío.';
      return;
    }

    this.validarStockAntesDeComprar();
  }

  private validarTarjetaDemo(): boolean {
    const numero = this.numeroTarjeta.replace(/\s/g, '');
    const titular = this.titularTarjeta.trim();
    const vencimiento = this.vencimientoTarjeta.trim();
    const cvv = this.cvvTarjeta.trim();

    if (!numero || !titular || !vencimiento || !cvv) {
      this.error = 'Completa los datos de tarjeta para continuar con la prueba.';
      return false;
    }

    if (!/^\d{16}$/.test(numero)) {
      this.error = 'Ingresa un número de tarjeta de 16 dígitos para la prueba.';
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento)) {
      this.error = 'Ingresa el vencimiento en formato MM/AA.';
      return false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      this.error = 'Ingresa un código de seguridad válido para la prueba.';
      return false;
    }

    return true;
  }

  // =========================================================
  // REVALIDAR STOCK ANTES DE COMPRAR
  // =========================================================

  private validarStockAntesDeComprar(): void {
    const itemsActuales = this.carritoService.items();

    if (itemsActuales.length === 0) {
      this.error = 'El carrito está vacío.';
      return;
    }

    this.procesando = true;
    this.error = '';

    const productosUnicos = [
      ...new Set(itemsActuales.map(item => item.idProducto))
    ];

    const consultas = productosUnicos.map(idProducto =>
      this.productoTallaService.listarPorProducto(idProducto).pipe(
        catchError(error => {
          console.error(
            'Error consultando stock del producto:',
            idProducto,
            error
          );

          return of(null as ProductoTalla[] | null);
        })
      )
    );

    forkJoin(consultas).subscribe({
      next: respuestas => {
        const consultaFallida = respuestas.some(
          respuesta => respuesta === null
        );

        if (consultaFallida) {
          this.procesando = false;
          this.error = 'No se pudo verificar el stock. Intenta nuevamente.';
          return;
        }

        const tallas = respuestas
          .filter(
            (respuesta): respuesta is ProductoTalla[] =>
              respuesta !== null
          )
          .flat();

        let stockModificado = false;
        let productoNoDisponible = false;

        for (const item of itemsActuales) {
          const productoTalla = tallas.find(
            talla => talla.idProductoTalla === item.idProductoTalla
          );

          if (!productoTalla) {
            productoNoDisponible = true;
            continue;
          }

          const stockActual = Math.max(0, productoTalla.stock);

          if (stockActual !== item.stock) {
            stockModificado = true;
          }

          if (stockActual <= 0) {
            productoNoDisponible = true;
          }

          if (item.cantidad > stockActual) {
            stockModificado = true;
          }

          this.carritoService.actualizarStock(
            item.idProductoTalla,
            stockActual
          );
        }

        if (productoNoDisponible) {
          this.procesando = false;
          this.error =
            'Uno o más productos ya no tienen stock disponible. Regresa al carrito para actualizar tu pedido.';
          return;
        }

        if (stockModificado) {
          this.procesando = false;
          this.error =
            'El stock de tu carrito cambió. Hemos actualizado las cantidades disponibles. Revisa tu pedido antes de continuar.';
          return;
        }

        this.registrarCompra();
      },

      error: error => {
        console.error('Error verificando stock:', error);
        this.procesando = false;
        this.error = 'No se pudo verificar el stock. Intenta nuevamente.';
      }
    });
  }

  // =========================================================
  // REGISTRAR COMPRA
  // =========================================================

  private registrarCompra(): void {
    const itemsActuales = this.carritoService.items();

    if (itemsActuales.length === 0) {
      this.procesando = false;
      this.error = 'El carrito está vacío.';
      return;
    }

    const request: CompraRequest = {
      items: itemsActuales.map(item => ({
        idProductoTalla: item.idProductoTalla,
        cantidad: item.cantidad
      })),
      medioPago: this.datos.metodoPago,
      direccionEnvio: {
        departamento: this.datos.departamento.trim(),
        provincia: this.datos.provincia.trim(),
        distrito: this.datos.distrito.trim(),
        direccionExacta: this.datos.direccion.trim(),
        referencia: this.datos.referencia.trim()
      }
    };

    this.ventaService.comprar(request).subscribe({
      next: (response: CompraResponse) => {
        this.procesando = false;

        const cliente = {
          ...this.datos
        };

        this.carritoService.vaciar();

        this.router.navigate(['/compra-exitosa'], {
          state: {
            compra: response,
            cliente: cliente
          }
        });
      },

      error: error => {
        console.error('Error realizando compra:', error);
        this.procesando = false;

        if (error.status === 401) {
          this.error = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
          return;
        }

        if (error.status === 403) {
          this.error = 'No tienes autorización para realizar esta operación.';
          return;
        }

        if (error.status === 409) {
          this.error =
            error?.error?.message ??
            'El stock o los datos de la compra cambiaron. Revisa tu pedido.';
          return;
        }

        this.error =
          typeof error.error === 'string'
            ? error.error
            : error?.error?.message ??
              'No se pudo registrar la compra.';
      }
    });
  }

  // =========================================================
  // NORMALIZAR TEXTO PARA ESTIMAR DELIVERY
  // =========================================================

  private normalizarTexto(valor: string): string {
    return valor
      .trim()
      .toLocaleLowerCase('es-PE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}