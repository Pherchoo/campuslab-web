# Flujo de trabajo

- main: base estable del proyecto.
- develop: integración del desarrollo.
- feature/base-entorno: estructura modular y configuración inicial.
- fix/ajustes: ajustes de tipado y archivos de verificación de la base inicial.

Los cambios futuros se hacen en ramas feature/* o fix/* y se revisan mediante Pull Requests hacia develop. La entrega estable se integra después a main. No se deben subir archivos .env reales, node_modules ni compilaciones.

Los commits iniciales reflejan únicamente el trabajo realizado; no se atribuyen aportaciones a otros integrantes.
