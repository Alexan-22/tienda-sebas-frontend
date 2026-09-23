export type MetodoPago =
  | 'YAPE'
  | 'TARJETA';


export interface DatosCheckout {

  nombres: string;

  apellidos: string;

  telefono: string;

  direccion: string;

  distrito: string;

  referencia: string;

  metodoPago: MetodoPago;
}