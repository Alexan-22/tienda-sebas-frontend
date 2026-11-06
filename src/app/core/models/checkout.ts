export type MetodoPago =
  | 'YAPE'
  | 'TARJETA'
  | 'CONTRA_ENTREGA';


export interface DatosCheckout {

  nombres: string;

  apellidos: string;

  telefono: string;

  departamento: string;

  provincia: string;

  distrito: string;

  direccion: string;

  referencia: string;

  metodoPago: MetodoPago;
}
