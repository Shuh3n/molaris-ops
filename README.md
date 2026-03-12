# App de gestión de citas — Centro odontológico / ortodoncia

Aplicación interna para la gestión de turnos y pacientes en un centro odontológico y de ortodoncia. Diseñada para uso administrativo y del personal clínico: programar y modificar citas, gestionar historiales de paciente, asignar profesionales y enviar recordatorios.

Características clave
- Programación y edición de citas (fecha, hora, profesional, sala).
- Gestión de pacientes (datos de contacto, historial, observaciones).
- Calendario integrado y vistas por día/semana/mes.
- Estados de cita y notificaciones (confirmación, recordatorio, cancelación).
- Control de acceso básico para personal (roles: admin, recepcionista, odontólogo).

Tecnologías
- Interfaz: React con Vite.
- Despliegue: Vercel (se incluye `vercel.json` para configurar cabeceras y caché del sitemap).

Instalación y ejecución local
1. Instala dependencias:

```bash
npm install
```

2. Ejecuta en desarrollo:

```bash
npm run dev
```

Variables de entorno
- Configure el archivo `.env` en la raíz con las variables necesarias, por ejemplo:

- `VITE_API_BASE_URL` — URL del backend/API.
- `VITE_APP_ENV` — entorno (development|production).

Despliegue
- Deploy recomendado en Vercel; el proyecto incluye `vercel.json` para asegurar `Content-Type` y política de caché del `/sitemap.xml`.

Contribución y contacto
- Esta app está pensada para uso interno; para cambios coordinar con el responsable técnico del centro.

Licencia
- Propiedad y licencia: consultar con la administración del centro.

