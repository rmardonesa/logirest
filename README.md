# logirest

Sistema web full-stack para la administracion de solicitudes de atencion de clientes en contexto logistico.

## Stack

| Capa | Tecnologia |
|------|------------|
| Frontend | Angular 22 (standalone, zoneless, signals) |
| Backend | NestJS 11 + TypeORM |
| Base de datos | PostgreSQL 16 |
| Autenticacion | JWT (passport) |
| Testing | Vitest (frontend), Jest (backend) |

## Estructura del proyecto

```
logirest/
├── backend/                 # API REST (NestJS)
│   ├── src/
│   │   ├── auth/           # Autenticacion JWT
│   │   ├── clientes/       # CRUD clientes
│   │   ├── config/         # Configuracion BD
│   │   ├── dashboard/      # Endpoint de resumen
│   │   ├── health/         # Health check
│   │   └── solicitudes/    # CRUD solicitudes
│   └── database/
│       ├── schema.sql      # Esquema de base de datos
│       └── seed.sql        # Datos de ejemplo
├── frontend/                # SPA (Angular)
│   └── src/app/
│       ├── core/           # Servicios, guardias, interceptores
│       ├── features/        # Paginas (dashboard, solicitudes, prospectos, login)
│       └── shared/         # Componentes reutilizables
├── docker-compose.yml       # Base de datos local
└── .env                    # Variables de entorno
```

## Prerrequisitos

- Node.js 22+
- Docker y Docker Compose
- npm

## Configuracion inicial

### 1. Base de datos

```bash
docker compose up -d

# Aplicar esquema y datos de ejemplo
npm run db:schema
npm run db:seed
```

### 2. Variables de entorno

El archivo `.env` en la raiz contiene la configuracion:

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del backend | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario BD | `postgres` |
| `DB_PASSWORD` | Password BD | `postgres` |
| `DB_NAME` | Nombre BD | `logirest` |
| `CORS_ORIGIN` | Origenes permitidos | `http://localhost:4200` |
| `JWT_SECRET` | Secreto para firmar tokens | (cambiar en produccion) |
| `JWT_EXPIRES_IN` | Duracion del token | `8h` |
| `AUTH_USUARIOS` | Credenciales usuario:clave | `admin:logirest2026,operador:operador2026` |

### 3. Backend

```bash
cd backend
npm install
npm run start:dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm run start
```

La aplicacion queda disponible en `http://localhost:4200`.

## Usuarios de prueba

| Usuario | Clave |
|---------|-------|
| `admin` | `logirest2026` |
| `operador` | `operador2026` |

## API endpoints

### Autenticacion
- `POST /auth/login` — Iniciar sesion, devuelve JWT

### Solicitudes
- `GET /solicitudes` — Listar con filtros (`?estado=`, `?search=`, `?pagina=`, `?limite=`)
- `GET /solicitudes/:id` — Obtener una solicitud
- `POST /solicitudes` — Crear solicitud
- `PATCH /solicitudes/:id` — Actualizar solicitud
- `PATCH /solicitudes/:id/cerrar` — Cerrar solicitud (cambia estado a Finalizada)
- `DELETE /solicitudes/:id` — Eliminar solicitud (solo si no esta Finalizada)

### Clientes
- `GET /clientes` — Listar clientes (`?search=`, `?tipo=`, `?pagina=`, `?limite=`)
- `GET /clientes/todos` — Listar todos los clientes (sin paginacion)
- `GET /clientes/:id` — Obtener un cliente
- `POST /clientes` — Crear cliente

### Dashboard
- `GET /dashboard/resumen` — Estadisticas: totales, solicitudes por estado, solicitudes recientes

### Health
- `GET /health` — Health check

## Funcionalidades

- Autenticacion JWT con proteccion de rutas
- Dashboard con resumen de solicitudes por estado
- CRUD completo de solicitudes (crear, editar, cerrar, eliminar)
- Filtros por estado y busqueda por texto en el listado
- Paginacion en listados
- Gestion de prospectos (clientes) con alta inline
- Autocompletado de clientes con busqueda por RUT/nombre en formulario de solicitudes
- Cierre de solicitudes con registro de fecha
- Diseno responsive

## Licencia

FSL-1.1-ALv2
