# DogHouse - Plataforma Web Oficial del Refugio de Animales

Plataforma integral desarrollada para el **Refugio de Animales DogHouse** (Santa Elena / Salinas, Ecuador), orientada a la gestión y difusión de adopciones responsables, apadrinamiento, donaciones, voluntariado, búsqueda comunitaria de perros perdidos y administración del refugio.

---

## 🐾 Características Principales

### 1. Catálogo de Adopción Responsable
- Fichas interactivas con galería de fotos en alta resolución (hasta 5 fotos por perrito).
- Filtros dinámicos por tamaño (Pequeño, Mediano, Grande), género (Macho, Hembra), edad y estado de salud (vacunados, esterilizados).
- Formulario oficial de postulación de adopción que envía la información y redirige de forma automática al WhatsApp del refugio con los datos prellenados.

### 2. Apadrinamiento y Donaciones
- Fichas de apadrinamiento mensual o recurrente para apoyar alimentación, vacunas y tratamientos médicos.
- Panel de Donaciones con datos bancarios oficiales de Ecuador (Banco Guayaquil, Pichincha, PayPal).
- Sistema de carga y verificación de comprobantes de transferencia con seguimiento de estado (Pendiente, Verificado, Rechazado).
- Barra de progreso interactiva para metas de insumos y necesidades prioritarias (alimento, medicinas, abrigo).

### 3. Red Comunitaria de Perros Perdidos y Encontrados
- Publicación de alertas ciudadanas de mascotas extraviadas o avistadas.
- Integración con enlaces directos a Google Maps para geolocalización exacta del punto de pérdida y sectores de referencia.
- Filtros de búsqueda en tiempo real por nombre, sector y fecha.
- Marcado de estado: *Buscando* o *Reunido con familia*.

### 4. Cartelera de Eventos y Jornadas
- Organización de ferias de adopción, campañas de esterilización y jornadas de voluntariado.
- Separación automática entre **Eventos Actuales** (en curso) y **Próximos Eventos**.
- Afiches informativos, fecha, hora, lugar y requisitos.

### 5. Voluntariado
- Formulario de registro para voluntarios en rescate, paseos, eventos, fotografía o transporte.
- Enlace directo al contacto de coordinación del refugio.

### 6. Panel Administrativo Seguro (`/panel-admin` y `/loginadmin`)
- Autenticación segura para administradores autorizados.
- Gestión completa (Crear, Editar, Eliminar y Cambiar Estado) de:
  - Catálogo de perritos en adopción y galería de fotos.
  - Insumos y necesidades del refugio con botones de incremento rápido (+1, +5, -1) en metas.
  - Eventos y jornadas.
  - Comprobantes de donación con visor de imágenes y contacto rápido por WhatsApp.
  - Solicitudes de adopción, padrinos y voluntarios.
  - Reportes de perros perdidos.
  - Gestión de administradores del sistema.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript, Vite
- **Estilos**: Tailwind CSS, Lucide React (iconos)
- **Base de Datos**: PostgreSQL / Supabase
- **Efectos y UX**: Canvas Confetti, transiciones fluidas y diseño responsivo adaptado a dispositivos móviles y de escritorio.
- **Despliegue**: Compatible con Vercel, Netlify y cualquier servidor Node.js/Vite estático.

---

## 🚀 Instalación y Desarrollo Local

### Requisitos Previos
- Node.js 18+ o Bun instalado.

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd refugio-doghouse
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` basado en `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 🗄️ Estructura de la Base de Datos

El proyecto incluye los scripts SQL listos para ejecutar en el panel de base de datos:
- `supabase_schema.sql`: Tablas de perros, necesidades, eventos, perros perdidos, donaciones, solicitudes y políticas de seguridad (RLS).
- `admin_table.sql`: Tabla de administradores (`public.admins`) con autenticación cifrada mediante `pgcrypto` (`crypt/gen_salt`).
- `create_admin.sql`: Script de utilidad para registrar un nuevo usuario administrador.

---

## 🌐 Despliegue en Vercel

El proyecto incluye el archivo de configuración `vercel.json` para garantizar el correcto enrutamiento SPA (Single Page Application) en rutas directas como `/loginadmin` y `/panel-admin`:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0.
Desarrollado para el **Refugio DogHouse Ecuador**.
