import { Routes } from '@angular/router';

import { Home } from './features/home/home';

import { ProductDetail } from './features/product-detail/product-detail';
import { Cart } from './features/cart/cart';
import { Login } from './features/login/login';
import { Registro } from './features/registro/registro';
import { Checkout } from './features/checkout/checkout';
import { CompraExitosa } from './features/compra-exitosa/compra-exitosa';
import { MisCompras } from './features/mis-compras/mis-compras';
import { DetalleCompra } from './features/detalle-compra/detalle-compra';
import { Tienda } from './features/tienda/tienda';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';


/* =========================================
   ADMIN
   ========================================= */

import { AdminLayout } from './features/admin/admin-layout/admin-layout';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Productos } from './features/admin/productos/productos';
import { ProductoForm } from './features/admin/producto-form/producto-form';
import { Stock } from './features/admin/stock/stock';
import { Vender } from './features/admin/vender/vender';
import { Ventas } from './features/admin/ventas/ventas';
import { Usuarios } from './features/admin/usuarios/usuarios';
import { Reportes } from './features/admin/reportes/reportes';
import { HomeAdmin } from './features/admin/home-admin/home-admin';


export const routes: Routes = [

  /* =========================================
     TIENDA PÚBLICA
     ========================================= */

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
    path: 'tienda',
    component: Tienda
  },


  /* =========================================
     CLIENTE AUTENTICADO
     ========================================= */

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


  /* =========================================
     ADMINISTRADOR
     ========================================= */

  {
    path: 'admin',

    component: AdminLayout,

    canActivate: [
      adminGuard
    ],

    children: [

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'productos',
        component: Productos
      },

      {
        path: 'productos/nuevo',
        component: ProductoForm
      },

      {
        path: 'productos/:id/editar',
        component: ProductoForm
      },

      {
        path: 'stock',
        component: Stock
      },

      {
        path: 'vender',
        component: Vender
      },

      {
        path: 'ventas',
        component: Ventas
      },

      {
        path: 'usuarios',
        component: Usuarios
      },

      {
        path: 'reportes',
        component: Reportes
      },

      {
        path: 'home',
        component: HomeAdmin
      }

    ]
  },


  /* =========================================
     RUTA NO ENCONTRADA
     ========================================= */

  {
    path: '**',
    redirectTo: ''
  }

];