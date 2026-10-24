# PaseoAPP

Aplicación React/Vite conectada a una API Spring Boot y una base de datos H2.

## Estructura del frontend

```text
src/
  components/
    auth/                 # sesión, contexto y rutas protegidas
    pages/                # vistas y dashboards por rol
      Administrador/      # alta/gestión de espacios y calendario de reservas
    Router/               # definición de rutas
  services/               # cliente Axios y llamadas a la API
  utils/                  # utilidades compartidas
  main.jsx
```

## Desarrollo local

1. Requiere Java 17 y Node.js.
2. Desde PowerShell, configura el administrador inicial (si aún no existe) y arranca el backend usando el Maven Wrapper incluido. No necesitas instalar `mvn` globalmente:

   ```powershell
   cd C:\Users\smith\Documents\Formulario\paseoGlobant
   $env:APP_ADMIN_EMAIL = "admin@ejemplo.com"
   $env:APP_ADMIN_NAME = "Administrador"
   $env:APP_ADMIN_PASSWORD = "Una-clave-larga-de-12-o-mas"
   .\mvnw.cmd spring-boot:run
   ```

   Ejecuta los comandos en la misma terminal y déjala abierta mientras uses la aplicación. Spring Boot convierte automáticamente esas variables a `app.admin.email`, `app.admin.name` y `app.admin.password`. Si no necesitas crear una cuenta administradora, puedes iniciar con solo `.\mvnw.cmd spring-boot:run`. El registro público crea usuarios con rol `USUARIO`. Usa `.\mvnw.cmd` en lugar de `mvn`, que puede no estar instalado o configurado en el PATH.

   También puedes iniciar el backend desde VS Code: abre **Run and Debug**, selecciona **PaseoAPP: Backend** y proporciona las credenciales cuando se soliciten. La tarea de compilación usa el Maven Wrapper del proyecto, no requiere instalar Maven globalmente.

3. En otra terminal, desde la raíz del repositorio:

   ```powershell
   npm install
   npm run dev
   ```

   Vite reenvía `/paseoapi` a `http://localhost:8080`. El navegador solo se comunica con el servidor Vite, por lo que el proxy evita CORS durante el desarrollo local.

## Autenticación y acceso

- `POST /paseoapi/v1/usuarios`: registro de usuario cliente; el rol se asigna en el servidor y nunca se acepta del formulario.
- `GET /paseoapi/v1/auth/csrf`: emite el token CSRF requerido antes de una operación que modifica estado.
- `POST /paseoapi/v1/auth/login`: inicia sesión con `{ "correo": "...", "contraseña": "..." }` y crea una sesión HTTP.
- `GET /paseoapi/v1/auth/me`: devuelve la sesión autenticada.
- `POST /paseoapi/v1/auth/logout`: cierra la sesión.
- Las contraseñas nuevas se guardan con BCrypt. Al iniciar, las contraseñas legadas en texto plano de la base H2 existente se convierten a BCrypt.
- Solo administradores pueden listar/modificar/eliminar usuarios y crear, modificar o eliminar espacios. El listado de espacios y sus fotos son públicos. Reservas requieren sesión de `USUARIO` o `ADMINISTRADOR`; cada reserva queda asociada al espacio y a quien la creó.
- La disponibilidad se consulta por espacio y horario: una reserva impide crear otra que se solape, pero no bloquea los demás horarios libres del mismo día. El backend vuelve a validar el intervalo para evitar conflictos si dos personas reservan a la vez. Los espacios con reservas no se pueden eliminar.
- El alta de espacios solo está disponible en el área administrativa e incluye carga de fotos JPG/PNG/WEBP de hasta 5 MB, guardadas en H2.
- React verifica la sesión en el servidor y aplica las mismas restricciones para decidir qué vistas mostrar. La API vuelve a validar permisos; ocultar una ruta en React no es el control de seguridad.

## HTTPS y despliegue

El backend del repositorio no trae certificados ni TLS configurado. Por eso `https://localhost:8080` no es válido con la configuración incluida; usa el proxy HTTP local indicado arriba. Para desplegar, termina TLS en Spring Boot o en un proxy inverso y establece `SESSION_COOKIE_SECURE=true`. Si React y la API se sirven desde orígenes distintos, configura `app.cors.allowed-origins` con el origen exacto del frontend (separados por coma) y define `VITE_API_BASE_URL` con la URL HTTPS de la API. Para un despliegue realmente cross-site, configura también `SESSION_COOKIE_SAME_SITE=none` junto con `SESSION_COOKIE_SECURE=true`. No uses `*` con cookies de sesión.

## Rutas del frontend

- Públicas: `/`, `/registro`, `/iniciar-sesion`.
- Cliente: `/cliente`, `/espacios`, `/reservas`.
- Administrador: `/administrador`, `/administrador/espacios`, `/administrador/espacios/nuevo`, `/administrador/reservas`. La ruta anterior `/espacios/crear` redirige a la nueva pantalla de alta.

El rol del backend `USUARIO` corresponde al cliente de la interfaz; `ADMINISTRADOR` corresponde al panel administrativo.
