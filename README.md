# logirest

<p align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">
  <img src="https://img.shields.io/badge/Nest-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img src="https://img.shields.io/badge/Postgres-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">
  <img src="https://img.shields.io/badge/Render-0B0D0E?style=for-the-badge&logo=render&logoColor=white">
</p>

Sistema web full-stack para la administración de solicitudes de atención de clientes en contexto logístico y de despachos. Reemplaza el registro manual en planillas por un sistema con API REST, autenticación y panel de control.

<p align="center">
  <img width="1352" height="807" alt="Screenshot_20260730_000147" src="https://github.com/user-attachments/assets/fd003c1d-bc69-4d30-bbf2-2b922149336e" />
</p>

## Demo

| Servicio | URL |
|---|---|
| Aplicación | https://logirest.vercel.app |
| API | https://logirest.onrender.com |
| Health check | https://logirest.onrender.com/health |

Las credenciales de acceso se entregan por correo junto a la prueba.

La API corre en la capa gratuita de Render, que suspende la instancia tras 15 minutos de inactividad. La primera petición después de un periodo inactivo puede tardar hasta 50 segundos mientras el servicio despierta.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 22 (standalone, zoneless, signals) |
| Backend | NestJS 11 + TypeORM |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (passport-jwt) |
| Testing | Vitest (frontend), Jest (backend) |
| Despliegue | Vercel (frontend), Render (API), Supabase (base de datos) |

## Estructura del proyecto

```
logirest/
├── backend/                      API REST (NestJS)
│   ├── src/
│   │   ├── auth/                 Autenticacion JWT, guard y estrategia
│   │   ├── clientes/             CRUD de clientes y validacion de RUT
│   │   ├── cliente-lookup/       Integracion con la API externa
│   │   ├── common/               Filtro de errores, DTOs y tipos compartidos
│   │   ├── config/               Fabrica de opciones de TypeORM
│   │   ├── dashboard/            Agregaciones para el panel
│   │   ├── health/               Health check
│   │   ├── proveedor-externo/    Registro externo simulado de clientes
│   │   └── solicitudes/          CRUD de solicitudes
│   ├── database/
│   │   ├── schema.sql            Tablas, constraints, indices y trigger
│   │   └── seed.sql              Datos iniciales
│   └── test/                     Suites e2e
├── frontend/                     SPA (Angular)
│   └── src/app/
│       ├── core/                 Servicios, guard, interceptor, modelos, utilidades
│       ├── features/             Pantallas: login, resumen, solicitudes, prospectos
│       └── shared/components/    Componentes reutilizables
├── docker-compose.yml            PostgreSQL para desarrollo local
└── .env.example                  Plantilla de variables de entorno
```

## Prerrequisitos

- Node.js 22 o superior
- Docker y Docker Compose
- npm

## Ejecución local

### 1. Base de datos

```bash
docker compose up -d
cd backend
npm install
npm run db:schema
npm run db:seed
```

`db:schema` crea las tablas con sus constraints e indices. `db:seed` carga 34 clientes y 250 solicitudes de ejemplo. Ambos scripts son idempotentes: se pueden correr varias veces sin duplicar datos.

### 2. Variables de entorno

Copia `.env.example` a `.env` en la raiz del proyecto y ajusta lo necesario.

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del backend | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de la base | `postgres` |
| `DB_PASSWORD` | Password de la base | `postgres` |
| `DB_NAME` | Nombre de la base | `logirest` |
| `DATABASE_URL` | Cadena de conexión completa; si esta definida, tiene prioridad sobre las anteriores | vacio |
| `DB_SSL` | Exige TLS en la conexión, necesario en Supabase | `false` |
| `CORS_ORIGIN` | Origenes permitidos, separados por coma | `http://localhost:4200` |
| `JWT_SECRET` | Secreto para firmar los tokens | obligatorio |
| `JWT_EXPIRES_IN` | Duración del token (hasta expiración) | `8h` |
| `AUTH_USUARIOS` | Credenciales en formato `usuario:clave`, separadas por coma | obligatorio |
| `PROVEEDOR_EXTERNO_URL` | Endpoint del registro externo de clientes | `http://localhost:3000/proveedor-externo/clientes` |
| `CLIENTE_LOOKUP_TIMEOUT_MS` | Timeout de la consulta externa | `2500` |

### 3. Backend

```bash
cd backend
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.

### 4. Frontend

```bash
cd frontend
npm install
npm run start
```

La aplicación queda disponible en `http://localhost:4200`.

## Tests

```bash
cd backend && npm run test:e2e     # 72 tests, 7 suites
cd frontend && npx vitest run      # 37 tests unitarios
```

Las suites e2e del backend corren contra la base de datos real y en serie, porque comparten estado. Requieren que el contenedor de PostgreSQL se encuentre levantado y sembrado.

## API

Los endpoints de lectura son públicos. Los de escritura requieren `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | JWT | Descripción |
|---|---|---|---|
| POST | `/auth/login` | No | Devuelve `access_token`, `token_type` y `expires_in` |

### Solicitudes

| Método | Ruta | JWT | Descripción |
|---|---|---|---|
| GET | `/solicitudes` | No | Listado paginado. Acepta `search`, `estado`, `order`, `page`, `limit` |
| GET | `/solicitudes/:id` | No | Solicitud con los datos de su cliente |
| POST | `/solicitudes` | Si | Crea con folio autogenerado y estado Pendiente |
| PUT | `/solicitudes/:id` | Si | Actualiza fecha, tipo, descripcion o estado |
| PATCH | `/solicitudes/:id/cerrar` | Si | Fuerza el estado a Finalizada |
| DELETE | `/solicitudes/:id` | Si | Elimina, responde 204 sin cuerpo |


<p align="center">
  <img width="1856" height="947" alt="Screenshot_20260729_234837" src="https://github.com/user-attachments/assets/3131f095-d057-4426-a456-cf2048e3c192" />

</p>


### Clientes

| Método | Ruta | JWT | Descripción |
|---|---|---|---|
| GET | `/clientes` | No | Listado paginado. Acepta `search`, `tipo`, `page`, `limit` |
| GET | `/clientes/:id` | No | Cliente por identificador |
| POST | `/clientes` | Si | Crea cliente, responde 409 si el RUT ya existe |
| PUT | `/clientes/:id` | Si | Actualiza cliente |

<p align="center">
  <img width="1905" height="949" alt="Screenshot_20260729_234803" src="https://github.com/user-attachments/assets/30d4e108-8107-471a-a549-32aafb17774e" />

</p>

### Dashboard e integración externa

| Método | Ruta | JWT | Descripción |
|---|---|---|---|
| GET | `/dashboard` | No | Totales por estado, solicitudes recientes, conteo por tipo y principales empresas |
| GET | `/cliente-lookup` | No | Busca un cliente por RUT o email. Acepta `query` |
| GET | `/proveedor-externo/clientes` | No | Registro externo simulado. Acepta `query`, `demora` y `falla` |
| GET | `/health` | No | Estado del servicio y de la conexion a la base |

<p align="center">
  <img width="1918" height="946" alt="Screenshot_20260729_234900" src="https://github.com/user-attachments/assets/2acd4fe7-8e98-40e3-ac02-dd763ecbbc93" />

</p>


### Convención de errores

Todos los endpoints devuelven la misma forma ante un error:

```json
{ "statusCode": 400, "message": "descripcion del error", "path": "/solicitudes" }
```

## Modelo de datos

Dos tablas normalizadas con relacion uno a muchos.

`clientes` guarda RUT unico opcional, nombre, email, telefono y tipo (persona natural o empresa).

`solicitudes` guarda el folio de negocio `SOL-{anio}-{correlativo}`, la referencia al cliente, fecha, tipo, estado y descripcion.

Decisiones relevantes:

- **`VARCHAR` con `CHECK` en vez de `ENUM`** para estado y tipo de solicitud. Da integridad a nivel de base sin acoplarse a un tipo especifico del motor ni sufrir la friccion de migrar enums en TypeORM, y el ORM lo trata como string plano.
- **Clave foranea con `ON DELETE RESTRICT`**, para que no se pueda borrar un cliente con solicitudes asociadas.
- **`synchronize: false` en TypeORM.** El DDL vive en `schema.sql` y es la fuente de verdad; el ORM no altera el esquema.
- **Cinco indices**: estado, fecha y cliente en solicitudes; nombre y email en clientes.
- **Trigger `set_updated_at`** que mantiene `updated_at` desde la base, no solo desde la aplicacion.

## Integración con API externa

`GET /cliente-lookup?query=` resuelve los datos de un cliente en tres niveles:

1. **Local.** Coincidencia exacta por RUT o email en la base. Responde `fuente: "local"` sin salir a la red.
2. **Externa.** Llamada HTTP al registro externo con timeout explicito. Responde `fuente: "externa"`.
3. **Simulada.** Si el proveedor excede el timeout, responde con error o es inalcanzable, devuelve datos simulados marcados `simulado: true` y `fuente: "simulada"`, nunca un 500.

El proveedor externo se configura con `PROVEEDOR_EXTERNO_URL`, asi que puede apuntarse a un servicio real sin tocar código. En este proyecto se implementa como un módulo aparte que emula un registro de terceros, con parámetros `demora` y `falla` para provocar timeout y caida a voluntad. El consumo es HTTP real, con manejo de timeout y de errores.

## Funcionalidades

- Autenticación JWT con guard de rutas e interceptor que adjunta el token y gestiona el 401
- Panel con tarjetas por estado, grafico de dona de principales empresas, grafico de barras por tipo y tabla de solicitudes recientes
- CRUD completo de solicitudes: crear, editar, cerrar y eliminar con confirmación
- Búsqueda por numero, descripción, nombre y email del cliente; filtro por estado; orden por fecha; paginación
- Gestión de prospectos con alta y edicion en linea, filtro por tipo y búsqueda
- Campo de RUT con formateo en vivo, segmentacion del digito verificador y restriccion de la letra K
- Autocompletado de datos del cliente desde el registro externo, con indicacion visible de la procedencia
- Tema claro y oscuro con persistencia, mas deteccion de la preferencia del sistema
- Diseño responsive en tres tramos: escritorio, tablet y móvil

## Despliegue

Tres servicios independientes.

### Base de datos, Supabase

Proyecto PostgreSQL en la region de Sao Paulo. El esquema y los datos se cargan pegando `backend/database/schema.sql` y luego `backend/database/seed.sql` en el SQL Editor.

La conexion se hace por el **session pooler en el puerto 5432**, no por el transaction pooler del 6543: este ultimo no soporta prepared statements y provoca fallas intermitentes con TypeORM.

La Data API de Supabase esta desactivada, porque el backend se conecta directo por protocolo Postgres y no se usa `supabase-js`. Eso evita exponer las tablas por PostgREST.

### API, Render

Web service desde el repositorio, con:

| Ajuste | Valor |
|---|---|
| Root directory | `backend` |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `npm run start:prod` |
| Health check path | `/health` |

El `--include=dev` es necesario porque `@nestjs/cli` es una dependencia de desarrollo y el build la requiere; sin esa bandera, un entorno con `NODE_ENV=production` la omite y la compilacion falla.

Variables a definir en el panel: `DATABASE_URL`, `DB_SSL=true`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AUTH_USUARIOS`, `CORS_ORIGIN`, `PROVEEDOR_EXTERNO_URL` y `CLIENTE_LOOKUP_TIMEOUT_MS`. No se define `PORT`: la plataforma la inyecta y la aplicacion la lee.

### Frontend, Vercel

Despliegue por CLI desde `frontend/`:

```bash
vercel --prod
```

`frontend/vercel.json` fija el directorio de salida en `dist/frontend/browser` y agrega el rewrite que redirige todas las rutas a `index.html`, necesario para que la navegacion directa a una ruta de la SPA no devuelva 404.

Antes de desplegar, define la URL de la API en src/environments/environment.ts. Para desarrollo local, Angular usa src/environments/environment.development.ts.

## Flujo de trabajo con Git

Rama principal `master`, integracion en `develop`, y ramas auxiliares por hito que nacen de `develop` y se integran mediante Pull Request. Los merges se hacen con `--no-ff` para que cada hito quede visible en el grafo. `master` recibe `develop` solo en puntos estables.

Las ramas de cada hito se conservan sin borrar (solo para efectos de ser examinado en contexto de prueba técnica, lo normal es borrar las ramas de features); de modo que el historial pueda revisarse por etapa.

## Mejoras futuras

- Documentación interactiva de la API con Swagger
- Integración continua con ejecucion de las suites en cada Pull Request
- Reemplazar el registro externo simulado por un servicio real de validacion de RUT (alguna API disponible en Chile, ya sea gubernamental o comercial)
- Ampliar la cobertura de tests unitarios en el frontend, hoy concentrada en las utilidades de RUT
- Registro de auditoría de cambios de estado, con autor y fecha

## Licencia

FSL-1.1-ALv2
