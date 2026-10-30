import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const host = window.location.hostname;

  const requestClonada = req.clone({
    setHeaders: {
      'X-Tenant-Domain': host
    }
  });

  return next(requestClonada);
};