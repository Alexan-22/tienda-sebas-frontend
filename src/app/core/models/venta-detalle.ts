import { ProductoTalla } from './producto-talla';


export interface Venta {

  idVenta: number;

  idUsuario: number;

  nombreCliente: string;

  apellidoCliente: string;

  correoCliente: string;

  fechaVenta: string;

  total: number;

  estado: string;

  medioPago: string;
}


export interface DetalleVenta {

  idDetalleVenta: number;

  idVenta: number;

  productoTalla: ProductoTalla;

  cantidad: number;

  precioUnitario: number;

  subtotal: number;
}


export interface DireccionEnvioResponse {

  id: number;

  departamento: string;

  provincia: string;

  distrito: string;

  direccionExacta: string;

  referencia: string | null;

  costoDelivery: number;
}


export interface DetalleCompraResponse {

  idVenta: number;

  fechaVenta: string;

  subtotal: number;

  costoDelivery: number;

  total: number;

  estado: string;

  medioPago: string;

  idUsuario: number;

  nombreCliente: string;

  apellidoCliente: string;

  correoCliente: string;

  direccionEnvio: DireccionEnvioResponse | null;

  detalles: DetalleVenta[];
}