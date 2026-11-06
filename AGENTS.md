# AGENTS.md — Angular storefront y administrador de tienda

Este repositorio es `D:\Proyectos\tienda-sebas-polvos-frontend`. Leer `D:\Proyectos\TiendaSebas\TiendaSebas\TAREA_MAESTRA_CODEX.md` y respetar API/entidades reales del backend.

- Angular 22; mantener storefront y admin por tienda sin clonar por tenant. Múltiples subdominios y temas por tienda, con control de autorización real en backend.
- Terminar flujos COD (cancelación con estado y motivo), dashboard dinero cobrado vs registrado, caja/arqueo, pagos reales según integración habilitada, devoluciones y comprobantes electrónicos como estados honestos.
- No afirmar pago, envío ni comprobante emitido si el servidor no lo confirma.
- Evitar secretos, tokens en fuentes, credenciales reales y datos de clientes en fixtures.
- Respetar UX actual y funcionamiento POS, catálogo, stock, checkout, pedidos y tracking; prueba de regresión de rutas críticas.
- Ejecutar lint/tests/build; documentar fallos, mantener contratos API coherentes con backend. No despliegue ni git push sin autorización.
