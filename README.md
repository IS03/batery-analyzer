# 🔋 Battery Analyzer

Una aplicación web moderna para analizar datos de baterías de dispositivos electrónicos. Procesa archivos CSV con información de ciclos de carga y estado de salud (SOH) para generar reportes detallados con métricas, gráficos y alertas.

## ✨ Características Principales

- 📊 **Análisis de Datos**: Procesamiento automático de archivos CSV con datos de baterías
- 📈 **Visualización**: Gráficos interactivos de SOH vs Ciclos con tendencias
- 🎯 **Métricas Avanzadas**: Cálculo de Theil-Sen, estimación de vida útil (ETA80)
- 🔍 **Detección Automática**: Identificación de marca y calidad de batería
- ⚠️ **Sistema de Alertas**: Validación automática de datos con alertas inteligentes
- 💾 **Almacenamiento Local**: Guardado de datasets en IndexedDB del navegador
- ☁️ **Sincronización**: Integración con Supabase para backup en la nube
- 📄 **Exportación PDF**: Generación de reportes en formato PDF
- 🔐 **Autenticación**: Login con Google OAuth
- 🌙 **Modo Oscuro**: Interfaz adaptativa con tema claro/oscuro

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd battery-analyzer
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Configurar Supabase (Opcional)

Para habilitar sincronización y autenticación:

1. Sigue las instrucciones en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. Configura Google OAuth en Supabase
3. Ejecuta el esquema de base de datos

### 5. Ejecutar en desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
battery-analyzer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/callback/      # Callback de autenticación
│   │   ├── globals.css         # Estilos globales
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página principal
│   ├── components/             # Componentes React
│   │   ├── auth/               # Componentes de autenticación
│   │   ├── pdf/                # Exportación PDF
│   │   ├── sync/               # Sincronización
│   │   └── ...                 # Otros componentes
│   └── lib/                    # Lógica de negocio
│       ├── parsers/            # Parsers de archivos CSV
│       ├── storage/            # IndexedDB y hash
│       ├── sync/               # Sincronización con Supabase
│       ├── pdf/                # Exportación PDF
│       └── ...                 # Utilidades y validaciones
├── public/fixtures/            # Archivos de ejemplo CSV
├── supabase-schema.sql         # Esquema de base de datos
└── ...                         # Archivos de configuración
```

## 🎯 Cómo Usar

### 1. Cargar Datos

- **Arrastra y suelta** un archivo CSV en el área designada
- O **haz clic** para seleccionar un archivo
- Los archivos se procesan completamente en tu navegador (privacidad garantizada)

### 2. Ver Resultados

Una vez cargado el archivo, verás:

- **Métricas Principales**: SOH actual y número de ciclos
- **Gráfico SOH vs Ciclos**: Visualización con línea de tendencia
- **Información de Batería**: Marca detectada y clasificación de calidad
- **Alertas**: Validaciones automáticas de los datos
- **Estimaciones**: Vida útil estimada (ETA80)

### 3. Gestionar Datasets

- **Guardado Automático**: Los datasets se guardan localmente
- **Lista de Datasets**: Accede a análisis previos
- **Sincronización**: Si tienes cuenta, los datos se respaldan en la nube

### 4. Exportar Reportes

- **Botón PDF**: Aparece cuando hay datos cargados
- **Opciones**: Anonimizado y metadatos
- **Descarga**: Archivo `battery-report.pdf`

## 📊 Formatos de Datos Soportados

La aplicación detecta automáticamente varios formatos de CSV:

- **Genérico**: Columnas con nombres estándar
- **Aftermarket**: Datos de baterías de reemplazo
- **Service Good**: Datos de baterías reacondicionadas
- **Demo**: Datos de demostración

### Columnas Reconocidas

- `cycles` / `cycle_count` / `ciclos`
- `soh` / `state_of_health` / `estado_salud`
- `fullChargeCapacity_mAh` / `capacidad_carga_completa`
- `designCapacity_mAh` / `capacidad_diseno`
- `temperature` / `temperatura`
- `voltage` / `voltaje`

## 🔧 Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts
- **Base de Datos Local**: Dexie (IndexedDB)
- **Backend**: Supabase (PostgreSQL + Auth)
- **PDF**: jsPDF + html2canvas
- **Parsing**: PapaParse (CSV)
- **Validación**: Zod
- **Estado**: Zustand

## 🚀 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linting con ESLint
```

## 🔐 Autenticación y Sincronización

### Características

- **Login con Google**: OAuth 2.0 integrado
- **Sincronización Automática**: Datos se suben al hacer login
- **RLS (Row Level Security)**: Cada usuario ve solo sus datos
- **Modo Offline**: Funciona sin conexión, sincroniza cuando hay internet

### Configuración

Ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para instrucciones detalladas.

## 📄 Exportación PDF

### Características

- **Formato A4**: Tamaño estándar con márgenes
- **Multipágina**: Soporte para contenido extenso
- **Anonimizado**: Opción para ocultar información sensible
- **Metadatos**: Fecha, hora y versión de la app

### Uso

1. Carga datos en la aplicación
2. Haz clic en "Exportar a PDF" en el header
3. Configura las opciones deseadas
4. Descarga el archivo `battery-report.pdf`

Ver [PDF_EXPORT_README.md](./PDF_EXPORT_README.md) para detalles técnicos.

## 🧪 Archivos de Prueba

En `public/fixtures/` encontrarás archivos CSV de ejemplo:

- `generico_aftermarket.csv` - Batería de reemplazo
- `generico_con_marca.csv` - Con información de marca
- `generico_demo.csv` - Datos de demostración
- `generico_es_coma_y_unidades.csv` - Formato español
- `generico_service_good.csv` - Batería reacondicionada

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Issues**: Reporta bugs en GitHub Issues
- **Documentación**: Revisa los archivos README específicos
- **Supabase**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **PDF Export**: [PDF_EXPORT_README.md](./PDF_EXPORT_README.md)

---

**Desarrollado con ❤️ para el análisis de baterías**
