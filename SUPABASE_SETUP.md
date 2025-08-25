# 🔐 Configuración de Supabase para Battery Analyzer

## 📋 Pasos para configurar autenticación y sincronización

### 1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la anon key

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Configurar Google OAuth

1. En Supabase Dashboard, ve a **Authentication > Providers**
2. Habilita **Google**
3. Configura las credenciales de Google OAuth:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea un proyecto o usa uno existente
   - Habilita Google+ API
   - Crea credenciales OAuth 2.0
   - Agrega las URLs de redirección:
     - `http://localhost:3000/auth/callback` (desarrollo)
     - `https://tu-dominio.com/auth/callback` (producción)

### 4. Ejecutar el esquema de base de datos

1. En Supabase Dashboard, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase-schema.sql`
3. Ejecuta el script completo

### 5. Verificar configuración

1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a `http://localhost:3000`
3. Haz clic en "Entrar con Google"
4. Completa el flujo de autenticación
5. Verifica que aparezca tu email en el header

## 🔧 Troubleshooting

### Error de OAuth redirect
- Verifica que las URLs de redirección en Google Cloud Console coincidan exactamente
- Asegúrate de que el callback URL en Supabase sea correcto

### Error de RLS (Row Level Security)
- Verifica que las políticas RLS estén creadas correctamente
- Asegúrate de que el usuario esté autenticado antes de hacer queries

### Error de CORS
- Supabase maneja CORS automáticamente
- Verifica que estés usando las variables `NEXT_PUBLIC_` correctamente

## 🧪 Pruebas

### Prueba de autenticación
1. Inicia sesión con Google
2. Verifica que aparezca tu email en el header
3. Cierra sesión y verifica que desaparezca

### Prueba de sincronización
1. Crea un reporte sin estar autenticado
2. Inicia sesión
3. Verifica que el reporte se suba automáticamente
4. Desde otro navegador, inicia sesión con la misma cuenta
5. Verifica que el reporte aparezca

### Prueba de RLS
1. Crea reportes con dos cuentas diferentes
2. Verifica que cada usuario solo vea sus propios reportes
