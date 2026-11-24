# CampusLab Web

Proyecto C del proyecto integrador de IDGS de la Universidad Tecnológica El Retoño. Sistema de Control de Laboratorios de Cómputo.

## Estado del avance

Base inicial en React JS con Vite, estructura modular, GitFlow y configuración de variables de entorno. La API todavía está pendiente de los datos del docente. Esta entrega no representa la aplicación final ni incluye autenticación funcional.

## Instalación

```bash
npm install
```

Copiar `.env.example` como `.env` y completar `VITE_API_URL` y `VITE_API_APP_TOKEN` cuando el docente los proporcione. Los valores vacíos son intencionales. Ambas aplicaciones consumirán la misma API REST.

```bash
npm run dev
```

Para compilar: `npm run build`.

## Organización

```text
src/
  components/
  pages/
  services/
  context/
  config/
  utils/
```

## Entorno y seguridad

`VITE_API_APP_TOKEN` se enviará como `x-api-token`. El JWT de usuario se recibirá al iniciar sesión y se enviará como `Authorization: Bearer <token>`; no se almacena en `.env`. El cliente base permite callbacks para limpiar la sesión ante 401 y mostrar acceso restringido ante 403; las pantallas de autenticación y su almacenamiento se implementarán después.

Las variables con prefijos VITE_ y EXPO_PUBLIC_ son visibles en el cliente compilado. No colocar contraseñas ni claves privadas en ellas. Se sigue el contrato de token de aplicación del documento de clase.

`.env` está excluido de Git; `.env.example` sí se versiona.

## GitFlow

Ver `docs/GITFLOW.md`. Se preparan main, develop, feature/base-entorno y fix/ajustes.

## Próximas etapas

Login y Registro, laboratorios y PCs, asignación y liberación con reporte de falla, panel administrativo y permisos por rol.
Navegación protegida mediante React Router y despliegue de la SPA.
