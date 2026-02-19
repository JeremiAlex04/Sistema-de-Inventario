# Sistema de Inventario (React + Neon PostgreSQL)

Aplicacion de inventario con:
- CRUD de productos
- Movimientos (entrada, salida, ajuste)
- Kardex, reportes y exportacion CSV
- Barra lateral para navegar por secciones
- Backend Node/Express conectado a NeonDB
- Configuracion fiscal Peru (RUC, regimen, comprobante, IGV)
- Productos con unidad de medida y afectacion IGV (gravado/exonerado/inafecto)

## 1) Variables de entorno

Crear `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Configurar:
- `DATABASE_URL` (cadena de Neon PostgreSQL)
- `PORT` (backend)
- `CORS_ORIGIN` (frontend)
- `VITE_API_BASE_URL` (URL del backend para el frontend)

## 2) Instalar dependencias

```bash
npm install
```

## 3) Ejecutar

Terminal 1 (API):

```bash
npm run server
```

Prueba rapida de conexion Neon (script solicitado):

```bash
npm run server:check-neon
```

Terminal 2 (Frontend):

```bash
npm run dev
```

## 4) Verificacion

```bash
npm run lint
npm run build
```

## Endpoints API

- `GET /api/health`
- `GET /api/bootstrap`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/movements`
