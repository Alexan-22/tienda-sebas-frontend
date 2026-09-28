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

export interface DetalleCompraResponse {

  idVenta: number;

  fechaVenta: string;

  total: number;

  estado: string;

  medioPago: string;

  idUsuario: number;

  nombreCliente: string;

  apellidoCliente: string;

  correoCliente: string;

  detalles: DetalleVenta[];

}