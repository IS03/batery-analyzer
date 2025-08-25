# 📄 Exportación a PDF - Battery Report

## ✅ Funcionalidad Implementada

Se ha agregado la funcionalidad completa de exportación a PDF al proyecto Battery Report con las siguientes características:

### 🎯 Características Principales

1. **Botón de Exportación**: Aparece en el header cuando hay datos cargados
2. **Formato A4**: Exportación en tamaño A4 con márgenes de 10mm
3. **Multipágina**: Soporte automático para contenido que excede una página
4. **Opciones de Anonimizado**: Toggle para ocultar información sensible
5. **Metadatos**: Encabezado opcional con fecha/hora y versión de la app
6. **Preservación de Badges**: Los badges de calidad mantienen sus colores

### 🔧 Archivos Creados/Modificados

#### Nuevos Archivos:
- `src/lib/pdf/exportToPdf.ts` - Lógica principal de exportación
- `src/components/pdf/ExportPDFButton.tsx` - Componente del botón con opciones

#### Archivos Modificados:
- `src/app/page.tsx` - Integración del botón y estructura exportable
- `src/app/globals.css` - Estilos para captura PDF y anonimizado
- `src/components/BatteryInfoCard.tsx` - Marcado de campos sensibles

### 📦 Dependencias Instaladas

```bash
npm install jspdf html2canvas
```

## 🚀 Cómo Usar

### 1. Cargar Datos
- Sube un archivo CSV con datos de batería
- O abre un dataset guardado previamente

### 2. Exportar a PDF
- El botón "Exportar a PDF" aparecerá en el header
- Configura las opciones:
  - **Anónimo**: Oculta información sensible (marca cruda)
  - **Incluir metadatos**: Agrega encabezado con fecha/hora

### 3. Descargar
- El PDF se descargará automáticamente como `battery-report.pdf`

## 🎨 Características Técnicas

### Estructura del PDF
- **Página A4**: 210×297mm
- **Márgenes**: 10mm en todos los lados
- **Encabezado**: 10mm de altura (si está habilitado)
- **Contenido**: Métricas, gráficos, alertas y información de batería

### Anonimizado
- Campos marcados con `data-sensitive="true"` se ocultan
- Aplicación de blur (6px) en lugar de ocultación completa
- Preserva la estructura del documento

### Multipágina
- Cálculo automático de páginas necesarias
- Encabezado repetido en cada página
- Continuidad visual del contenido

## 🧪 Pruebas Realizadas

- ✅ Compilación exitosa del proyecto
- ✅ Integración correcta en la interfaz
- ✅ Estructura de archivos creada
- ✅ Dependencias instaladas correctamente

## 🔮 Próximos Pasos

1. **Pruebas en Navegador**: Verificar funcionamiento real
2. **Optimización**: Ajustar calidad vs tamaño del PDF
3. **Personalización**: Agregar logo o branding
4. **Formatos Adicionales**: Exportación a CSV/JSON

## 🐛 Troubleshooting

### Problemas Comunes:
- **PDF vacío**: Verificar que el elemento `#reportRoot` existe
- **Calidad baja**: Aumentar `scale` en `html2canvas` (tradeoff: tamaño)
- **Elementos cortados**: Verificar que no hay elementos `position: fixed`

### Debug:
- Revisar consola del navegador para errores
- Verificar que `html2canvas` y `jsPDF` están disponibles
- Comprobar que el nodo objetivo es visible

---

**Estado**: ✅ Implementado y listo para pruebas
**Versión**: MVP
**Compatibilidad**: Next.js 15.5.0, React 19.1.0
