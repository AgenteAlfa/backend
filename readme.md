# citap-backend

Backend **Node.js (24.13)** + **Express** + **MySQL** para gestión de **clientes** y **citas**, con:
- ✅ CRUD REST
- ✅ Borrado lógico en **clientes** (`activo_cliente`)
- ✅ Estados de cita: `pendiente`, `confirmada`, `rechazado`
- ✅ Validación de entrada con **Joi**
- ✅ Autenticación mínima con **JWT (Bearer Token)**

---

## Requisitos

- **NVM** instalado (recomendado)
- **Node.js 24.13**
- MySQL (8+ recomendado)

### Instalar/usar Node 24.13 con NVM

```bash
nvm install 24.13
nvm use 24.13
node -v
```

---

## Instalación

```bash
npm install
```

---

## Configuración de entorno

Crea un archivo `.env` (puedes copiar `.env.example`) y rellena tus credenciales:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
JWT_EXPIRES_IN=8h

PORT = 8000
```
Tambien se usa .env.test para las pruebas, es necesario tener un usuario con privilegios adecuados o sino la bd ya creada porque aveces falla si el usuario no tiene los permisos correctos

> **Notas**
> - `DB_HOST` suele ser `127.0.0.1` o el host de tu contenedor/servidor MySQL.
> - `DB_NAME` recomendado: `citap` (o el que te pidan).

---

## Inicializar Base de Datos (crear tablas + seed + data random)

Ejecuta:

```bash
npm run db:init
```

Esto:
1. Crea la base de datos (`DB_NAME`) si no existe.
2. Crea tablas:
   - `clientes`
   - `estados_cita`
   - `citas`
3. Inserta estados en `estados_cita` si no existen:
   - `pendiente`
   - `confirmada`
   - `rechazado`
4. Si las tablas están vacías, genera data de prueba:
   - 400 clientes (20 nombres × 20 apellidos) desde `src/db/random_data.json`
   - citas aleatorias con fechas entre 2 semanas antes y 1 semana después de hoy, con distribución de estados

---

## Ejecutar el servidor

### Desarrollo (auto-reload)
```bash
npm run dev
```

### Producción / normal
```bash
npm start
```

El servidor imprime el puerto en consola, por ejemplo:
- `API running on http://localhost:3000`

---

## Autenticación (JWT)

Casi todos los endpoints (clientes/citas) requieren header:

```
Authorization: Bearer <token>
```

### Obtener token (login demo)
**POST** `/auth/login`

Body JSON:
```json
{ "username": "admin", "password": "admin123" }
```

Respuesta **200**:
```json
{ "token": "<jwt>" }
```

---

# Endpoints (REST) y respuestas

## Health

### GET `/health`
Verifica que el API y DB respondan.

Respuesta **200**:
```json
{ "status": "ok", "db": true }
```

---

## Auth

### POST `/auth/login`
Login demo, retorna JWT.

**Request body**
```json
{ "username": "admin", "password": "admin123" }
```

**Respuesta 200**
```json
{ "token": "<jwt>" }
```

**Errores**
- **400**: validación Joi (faltan campos)
- **401**: credenciales inválidas

---

## Clientes (protegido con JWT)

> **Regla de borrado lógico**: `DELETE` no elimina el registro, solo setea `activo_cliente=0`.  
> Por defecto, los `GET` devuelven **solo clientes activos**.

### GET `/clientes`
Lista clientes activos.

**Respuesta 200**: array de clientes
```json
[
  {
    "id_cliente": 1,
    "nombre_cliente": "Ana Pérez",
    "telefono_cliente": "912345678",
    "email_cliente": "ana_perez@correo.com",
    "activo_cliente": 1
  }
]
```

#### Query opcional
- `GET /clientes?include_inactive=true`  
Incluye clientes inactivos (si tu service lo soporta).

---

### GET `/clientes/:id`
Devuelve un cliente **activo** por id.

**Respuesta 200**
```json
{
  "id_cliente": 1,
  "nombre_cliente": "Ana Pérez",
  "telefono_cliente": "912345678",
  "email_cliente": "ana_perez@correo.com",
  "activo_cliente": 1
}
```

**Errores**
- **400**: id inválido
- **404**: no existe o está inactivo

---

### POST `/clientes`
Crea un cliente (activo por defecto).

**Request body**
```json
{
  "nombre_cliente": "Cliente X",
  "telefono_cliente": "912345678",
  "email_cliente": "cliente_x@correo.com"
}
```

**Respuesta 201**
```json
{
  "id_cliente": 123,
  "nombre_cliente": "Cliente X",
  "telefono_cliente": "912345678",
  "email_cliente": "cliente_x@correo.com",
  "activo_cliente": 1
}
```

**Errores**
- **400**: validación Joi (teléfono/email inválidos, etc.)
- **401**: sin token o token inválido

---

### PUT `/clientes/:id`
Actualiza campos del cliente.

**Request body (ejemplo)**
```json
{ "nombre_cliente": "Cliente X Updated" }
```

**Respuesta 200**
```json
{
  "id_cliente": 123,
  "nombre_cliente": "Cliente X Updated",
  "telefono_cliente": "912345678",
  "email_cliente": "cliente_x@correo.com",
  "activo_cliente": 1
}
```

**Errores**
- **400**: id inválido / validación Joi
- **404**: no encontrado
- **401**: sin token

---

### DELETE `/clientes/:id`
Borrado lógico: `activo_cliente=0`.

**Respuesta 204** (sin body)

**Errores**
- **400**: id inválido
- **404**: no encontrado
- **401**: sin token

---

## Citas (protegido con JWT)

> `DELETE` no borra la fila: marca el estado como `rechazado`.  
> Los estados válidos: `pendiente | confirmada | rechazado`.

### GET `/citas`
Lista de citas (incluye datos del cliente y estado).

**Respuesta 200**: array
```json
[
  {
    "id_cita": 350,
    "fecha_cita": "2026-01-29T10:30:00.000Z",
    "cliente_cita": 1,
    "nombre_cliente": "Ana Pérez",
    "telefono_cliente": "912345678",
    "email_cliente": "ana_perez@correo.com",
    "estado": "confirmada"
  }
]
```

---

### GET `/citas/:id`
Detalle de una cita.

**Respuesta 200**
```json
{
  "id_cita": 350,
  "fecha_cita": "2026-01-29T10:30:00.000Z",
  "cliente_cita": 1,
  "nombre_cliente": "Ana Pérez",
  "telefono_cliente": "912345678",
  "email_cliente": "ana_perez@correo.com",
  "estado": "pendiente"
}
```

**Errores**
- **400**: id inválido
- **404**: no encontrada
- **401**: sin token

---

### GET `/citas/estado/:estado`
Filtra citas por estado (`pendiente|confirmada|rechazado`).

Ejemplos:
- `/citas/estado/pendiente`
- `/citas/estado/confirmada`
- `/citas/estado/rechazado`

**Respuesta 200**: array (puede ser vacío)
```json
[
  { "id_cita": 1, "fecha_cita": "...", "cliente_cita": 10, "estado": "pendiente", "nombre_cliente": "..." }
]
```

---

### POST `/citas`
Crea una cita.

**Request body**
```json
{
  "fecha_cita": "2026-01-29T10:30:00.000Z",
  "cliente_cita": 1,
  "estado": "pendiente"
}
```

- `estado` es opcional; si no se manda, se usa `pendiente`.

**Respuesta 201**
```json
{
  "id_cita": 351,
  "fecha_cita": "2026-01-29T10:30:00.000Z",
  "cliente_cita": 1,
  "nombre_cliente": "Ana Pérez",
  "telefono_cliente": "912345678",
  "email_cliente": "ana_perez@correo.com",
  "estado": "pendiente"
}
```

**Errores**
- **400**: validación Joi / cliente inválido o inactivo / estado inválido
- **401**: sin token

---

### PUT `/citas/:id`
Actualiza fecha/cliente/estado.

**Request body (ejemplo)**
```json
{ "estado": "confirmada" }
```

**Respuesta 200**
```json
{
  "id_cita": 351,
  "fecha_cita": "2026-01-29T10:30:00.000Z",
  "cliente_cita": 1,
  "estado": "confirmada",
  "nombre_cliente": "Ana Pérez",
  "telefono_cliente": "912345678",
  "email_cliente": "ana_perez@correo.com"
}
```

**Errores**
- **400**: id inválido / validación Joi / cliente inválido o inactivo / estado inválido
- **404**: no encontrada
- **401**: sin token

---

### DELETE `/citas/:id`
Marca la cita como `rechazado`.

**Respuesta 204** (sin body)

**Errores**
- **400**: id inválido
- **404**: no encontrada
- **401**: sin token

---

## Validación (Joi)

La validación vive en:
- `src/validators/auth.validator.js`
- `src/validators/clientes.validator.js`
- `src/validators/citas.validator.js`

Y se aplica en rutas con el middleware:
- `src/middlewares/validate.middleware.js`

---

## Estructura del proyecto (resumen)

- `src/routes/` define endpoints (HTTP)
- `src/controllers/` orquesta request/response
- `src/services/` contiene reglas + queries SQL
- `src/db/` conexión + init/seed
- `src/validators/` esquemas Joi
- `src/middlewares/` auth JWT + validate Joi
