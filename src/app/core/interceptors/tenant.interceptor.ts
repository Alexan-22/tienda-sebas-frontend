import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  // Captura el subdominio/dominio actual (ej. sebascollection.com o cliente2.com)
  const domain = window.location.hostname;

  const tenantReq = req.clone({
    setHeaders: {
      'X-Tenant-Domain': domain
    }
  });

  return next(tenantReq);
};