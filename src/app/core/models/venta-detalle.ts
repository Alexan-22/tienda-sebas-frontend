import {
  ProductoTalla
} from './producto-talla';


export interface Venta {

  idVenta: number;

  fechaVenta: string;

  total: number;

  estado: string;

  medioPago: string;
}


export interface DetalleVenta {

  idDetalleVenta: number;

  productoTalla: ProductoTalla;

  cantidad: number;

  precioUnitario: number;

  subtotal: number;
}