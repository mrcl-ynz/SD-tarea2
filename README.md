# Sistemas Distribuidos - Tarea 2: Kafka

Para levantar la topología:

```
docker compose up -d
```

La API escucha en `localhost:3000` y los endpoints son:

- `/registro`: Recibe una solicitud para el ingreso de un miembro.
- `/venta`: Registra una venta realizada en un carrito.
- `/denuncia`: Recibe las denuncias de carritos prófugos.

Cada consumer escribe sus operaciones en un archivo `.log`. Por lo que existen cuatro archivos, uno para cada servicio (registro de miembros, cálculo de total de ventas, servicio de stock y servicio de ubicación).