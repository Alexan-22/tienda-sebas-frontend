import {
  Routes
} from '@angular/router';


import {
  Home
} from './features/home/home';

import {
  ProductDetail
} from './features/product-detail/product-detail';

import {
  Cart
} from './features/cart/cart';

import {
  Login
} from './features/login/login';

import {
  Registro
} from './features/registro/registro';

import {
  Checkout
} from './features/checkout/checkout';

import {
  CompraExitosa
} from './features/compra-exitosa/compra-exitosa';

import {
  MisCompras
} from './features/mis-compras/mis-compras';

import {
  DetalleCompra
} from './features/detalle-compra/detalle-compra';

import {
  authGuard
} from './core/guards/auth-guard';


export const routes:
  Routes = [

  {
    path: '',
    component: Home
  },

  {
    path: 'producto/:id',
    component: ProductDetail
  },

  {
    path: 'carrito',
    component: Cart
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'registro',
    component: Registro
  },

  {
    path: 'checkout',
    component: Checkout,
    canActivate: [
      authGuard
    ]
  },

  {
    path: 'compra-exitosa',
    component: CompraExitosa,
    canActivate: [
      authGuard
    ]
  },

  {
    path: 'mis-compras',
    component: MisCompras,
    canActivate: [
      authGuard
    ]
  },

  {
    path: 'mis-compras/:id',
    component: DetalleCompra,
    canActivate: [
      authGuard
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];