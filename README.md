# Backend del calendario

API REST para la aplicación de calendario de servicios y turnos. Está construida con Node.js, Express y MongoDB mediante Mongoose.

## Requisitos

- Node.js y npm
- Una base de datos MongoDB accesible (por ejemplo, MongoDB Atlas)

## Configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.template` a `.env`.
3. Completa en `.env` los valores de tu entorno:

   | Variable | Uso |
   | --- | --- |
   | `PORT` | Puerto HTTP del servidor. |
   | `DB_CNN` | URI de conexión a MongoDB. |
   | `SECRET_JWT_SEED` | Secreto privado para firmar tokens JWT. |
   | `ADMIN_EMAIL` | Correo de la cuenta administradora. |

   No compartas ni subas el archivo `.env`; contiene credenciales y secretos.

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Para iniciar sin Nodemon, usa `npm start`.

Por defecto, el frontend local utiliza la API en `http://localhost:4000/api`.

## Funcionalidades

- Autenticación mediante JWT y cuentas de usuario/administrador.
- Gestión de servicios y descansos asignados a empleados.
- Panel administrativo para consultar los servicios semanales, registrar incidencias y marcar servicios completados.
- Los servicios se conservan en la base de datos después de su fecha; se pueden consultar navegando a semanas anteriores y eliminar manualmente desde el panel cuando corresponda.
- API de calendario y mensajería.

## Seguridad

`.env`, variantes locales de configuración y `node_modules` están excluidos de Git mediante `.gitignore`. El archivo `.env.template` solo debe contener nombres de variables y valores de ejemplo, nunca credenciales reales.
