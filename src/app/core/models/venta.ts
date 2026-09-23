export interface CompraItem {

  idProductoTalla: number;

  cantidad: number;
}


export interface CompraRequest {

  items: CompraItem[];

  medioPago:
    | 'YAPE'
    | 'TARJETA';
}


export interface CompraResponse {

  idVenta: number;

  total: number;

  estado: string;

  medioPago: string;

  mensaje: string;
}