import {
  ProductoTalla
} from './producto-talla';


export interface UsuarioVenta {

  idUsuario: number;

  nombre: string;

  apellido: string;

  correo: string;

  estado: boolean;

}


export interface Venta {

  idVenta: number;

  usuario: UsuarioVenta;

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