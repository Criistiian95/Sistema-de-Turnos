# Sismed v2 — frontend, API y base de datos

Esta entrega mejora ingreso, resumen, pacientes, profesionales y reservas. Está preparada para una **base MySQL nueva** y un único consultorio. El frontend v2 debe usarse con el backend v2: no es compatible con todas las respuestas de la API anterior.

## Qué incluye

- Frontend React: navegación adaptable, formularios con validación, búsqueda por DNI, profesionales desde la base, resumen antes de reservar y mensajes de error recuperables.
- API: autenticación en las rutas de datos, perfiles sin contraseñas, roles, invitación para nuevas cuentas y sesiones revocadas al cerrar sesión.
- MySQL: pacientes, médicos, especialidades, usuarios, roles, sesiones y turnos; claves foráneas e índices.
- Reserva en intervalos de 30 minutos, conflicto por médico/fecha controlado por un índice único. Médicos distintos pueden atender al mismo horario. No se implementaron duraciones variables ni agendas laborales por profesional.
- Cancelación explícita: conserva el registro y libera el horario; no elimina el historial.
- Datos de paciente/médico incluidos en la consulta de turnos: evita dos pedidos extra por fila.
- Registro de médicos limitado al administrador. El registro por invitación siempre crea recepción, aunque alguien intente enviar otro rol.

## Mirar el diseño sin instalar

Abrir `Sismed-demo-v2.html` en Chrome o Edge. Es una demo autónoma con datos ficticios y peticiones simuladas, sin conexión al backend. Permite recorrer las pantallas; usar DNI **00000001**. No ingresar información real. Sus cambios se descartan al recargar. Esta demo sirve para revisar diseño y navegación, no para certificar el funcionamiento de MySQL.

## Probar en tu computadora

Requisitos: Node.js 24 o posterior, npm y MySQL 8 (o Docker Desktop si preferís iniciar la base con el archivo incluido).

### 1. Base y backend

Desde la carpeta `backend` del ZIP (contiene package.json):

1. Copiar `.env.example` como `.env`.
2. Crear una base vacía `sismed` y un usuario con permisos sobre esa base. Si usás Docker, completar `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD` con contraseñas distintas y ejecutar `docker compose up -d db`. Esperar que la base termine de arrancar. No usar `docker compose down -v` si querés conservar datos.
3. Completar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`; o usar `DATABASE_URL`. No combinar valores de servicios distintos.
4. Generar JWT_SECRET en tu terminal y guardar el resultado en `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

5. Ejecutar:

```bash
npm ci
npm run db:check
npm run db:migrate
```

6. Para crear el primer administrador, completar temporalmente `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 12 caracteres, máximo 72 bytes), `ADMIN_NAME` y `ADMIN_LASTNAME` en `.env` y ejecutar:

```bash
npm run admin:create
```

7. Quitar `ADMIN_PASSWORD` de `.env`. Para permitir accesos de recepción, definir un `REGISTRATION_CODE` aleatorio y comunicarlo únicamente al equipo autorizado. Dejarlo vacío deshabilita el registro por invitación. No permite elegir un rol de administrador.
8. Ejecutar:

```bash
npm start
```

Comprobar `http://localhost:3003/health/ready`; debe responder `ready`. El servidor no inicia si la conexión o las tablas principales no están listas. Los errores no muestran credenciales.

### 2. Frontend

En otra terminal, dentro de `frontend`:

1. Copiar `.env.example` como `.env` y dejar `REACT_APP_API_URL=http://localhost:3003`.
2. Ejecutar:

```bash
npm ci
npm start
```

3. Abrir `http://localhost:3000` e ingresar con el administrador creado.
4. Agregar un profesional y un paciente de prueba; reservar y cancelar un turno.

En local no se conecta a la API anterior. En producción no existe una URL por defecto: es obligatorio configurar `REACT_APP_API_URL` antes de compilar.

## Conectar MySQL en Railway

Estos pasos están preparados, pero NO ejecutados en tu cuenta.

1. Dentro del mismo proyecto Railway, agregar un servicio **MySQL nuevo** o identificar una base existente **vacía** destinada a esta versión.
2. En las variables del servicio backend, agregar `DATABASE_URL` como referencia a `MYSQL_URL` del servicio MySQL. Si el servicio se llama exactamente `MySQL`, la referencia es:

```text
DATABASE_URL=${{MySQL.MYSQL_URL}}
```

Usar el selector de referencias de Railway si tiene otro nombre. La URL privada se usa dentro del proyecto Railway; para conexión desde tu computadora se necesita la URL pública que Railway indique.

3. Configurar en backend:

```text
NODE_ENV=production
JWT_SECRET=<secreto aleatorio generado en tu terminal>
FRONTEND_URL=https://fontend-sistu-production.up.railway.app
```

Si cambia el dominio del frontend, actualizarlo. FRONTEND_URL admite varios orígenes separados por coma, sin barra final. PORT lo asigna Railway.

4. El repositorio `Sistema-de-Turnos` usa la **raíz** como directorio del servicio. `npm start` ejecuta `backend/app.js`. La carpeta histórica `sismed` del repositorio no es el frontend de esta entrega.
5. Ejecutar `npm run db:migrate` en el entorno conectado a esa base. Para una base nueva podés configurarlo como comando previo al despliegue. Luego configurar `npm start` como inicio y `/health/ready` como ruta de salud.
6. Crear el administrador mediante `npm run admin:create` con las variables temporales indicadas y luego quitar ADMIN_PASSWORD.
7. En el servicio frontend configurar:

```text
REACT_APP_API_URL=https://<dominio-publico-del-backend>
```

Usar el dominio que Railway muestre para TU servicio; no copiar una URL antigua por suposición. Reconstruir el frontend porque React incorpora la variable al compilar.
8. Probar con datos ficticios ingreso, alta de profesional, alta de paciente, reserva, reserva duplicada y cancelación antes de usar datos reales.

Referencias oficiales:
- https://docs.railway.com/databases/mysql
- https://sequelize.org/docs/v6/other-topics/migrations/

## Si ya había datos

La migración se niega a actuar sobre una base no vacía que no tenga el historial de esta versión. No borra ni transforma silenciosamente tablas anteriores. Las migraciones antiguas quedan fuera del flujo nuevo y no deben ejecutarse.

Para conservar datos existentes hay que revisar el esquema real, hacer una copia y preparar una migración de datos específica. No se realizó esa operación ni se accedió a la base antigua.

La contraseña de base encontrada en la versión anterior estaba incluida en el repositorio. Si sigue vigente, cambiarla en Railway. Esta entrega la elimina de la configuración actual, pero eso no la quita del historial de Git.

## Pruebas y límites

- Frontend: compilación de producción correcta y 5 pruebas de ingreso, validación, reintento de agenda, cancelación confirmada por servidor y persistencia de sesión.
- Backend: 10 pruebas con HTTP, modelos, migración y restricciones relacionales en SQLite aislado usando Node. Comprueban autenticación, roles, DNI duplicado, varios médicos por especialidad, reservas simultáneas, datos asociados, cancelación y revocación de sesión.
- No se verificó contra MySQL real ni contra Railway: la conexión está pendiente.
- Para correr los mismos casos en MySQL, definir `SISMED_TEST_MYSQL_URL` apuntando a una base vacía cuyo nombre termine en `_test` y ejecutar `npm run test:mysql`. Se rechazan bases no vacías y se conservan los datos de prueba al terminar. Usar una nueva base vacía para repetir.
- El navegador disponible bloqueó los archivos y la dirección local. La adaptación visual está implementada, pero falta revisión visual manual en escritorio y celular.
- Create React App conserva avisos de mantenimiento; no se migró a otra herramienta de compilación en esta entrega.
- El sistema sigue siendo para un único consultorio. No incluye aislamiento entre organizaciones, historias clínicas, recuperación de contraseña, agenda por duración variable ni auditoría de accesos.
- No se subieron cambios a GitHub ni se desplegaron en Railway.

Comandos de pruebas:

```bash
# backend
npm test
# frontend
npm test -- --watchAll=false --runInBand
npm run build
```
