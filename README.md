# 🎨 Generador de Diagramas con IA

Un sistema web avanzado que utiliza Inteligencia Artificial (Google Gemini) para generar diagramas profesionales en formato Mermaid a partir de descripciones en lenguaje natural y análisis de archivos.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Tipos de Diagramas](#-tipos-de-diagramas)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Licencia y Derechos de Autor](#️-licencia-y-derechos-de-autor)
- [Contacto](#-contacto)

## ✨ Características

- **Generación Inteligente**: Crea diagramas automáticamente usando IA (Google Gemini)
- **Múltiples Tipos**: Soporte para flowcharts, diagramas ER, organigramas, y más
- **Análisis de Archivos**: Procesa imágenes y documentos para extraer información
- **Chat Interactivo**: Mejora y modifica diagramas mediante conversación natural
- **Exportación Múltiple**: Descarga en formato SVG o código Mermaid
- **Modo Oscuro**: Interfaz adaptable con soporte para tema claro/oscuro
- **Drag & Drop**: Carga de archivos mediante arrastrar y soltar
- **Responsive**: Diseño completamente adaptable a dispositivos móviles

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica moderna
- **Tailwind CSS**: Framework de CSS utilitario para diseño responsive
- **JavaScript ES6+**: Funcionalidades modernas del navegador
- **Mermaid.js**: Renderizado de diagramas
- **DOMPurify**: Sanitización de contenido para seguridad

### APIs y Servicios
- **Google Gemini AI**: Modelo de IA generativa para procesamiento de texto e imágenes
- **File API**: Manejo de archivos locales
- **LocalStorage**: Persistencia de configuración del usuario

### Herramientas de Desarrollo
- **Marked.js**: Procesamiento de Markdown
- **Import Maps**: Gestión de módulos ES6

## 📦 Instalación

### Opción 1: Descarga Directa
```bash
# Clona o descarga el repositorio
git clone https://github.com/tu-usuario/generador-diagramas-ia.git
cd generador-diagramas-ia
```

### Opción 2: Servidor Local
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

### Opción 3: Abrir Directamente
Simplemente abre el archivo `index.html` en tu navegador web moderno.

## ⚙️ Configuración

### 1. Obtener API Key de Google Gemini

1. Visita [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API Key
4. Copia la clave generada

### 2. Configurar la API Key en la Aplicación

1. Abre la aplicación en tu navegador
2. Haz clic en "Gestionar API Key" en la esquina superior derecha
3. Pega tu API Key en el campo correspondiente
4. Haz clic en "Guardar API Key"

> ⚠️ **Nota de Seguridad**: La API Key se almacena localmente en tu navegador y no se comparte con terceros.

## 🎯 Uso

### Generación Básica de Diagramas

1. **Configuración Inicial**:
   - Título del diagrama
   - Selecciona el tipo de diagrama
   - Añade una descripción detallada

2. **Carga de Archivos (Opcional)**:
   - Arrastra archivos al área designada
   - Soporta imágenes (PNG, JPG, GIF)
   - Soporta archivos de texto (TXT, CSV)

3. **Generación**:
   - Haz clic en "Generar Diagrama"
   - Espera mientras la IA procesa tu solicitud
   - Revisa el diagrama generado

4. **Mejoras con Chat**:
   - Utiliza el chat interactivo para modificaciones
   - Describe cambios en lenguaje natural
   - La IA actualizará el diagrama automáticamente

### Exportación

- **Copiar Código**: Copia el código Mermaid al portapapeles
- **Exportar SVG**: Descarga el diagrama como imagen vectorial

## 📊 Tipos de Diagramas

### Diagramas de Flujo (Flowcharts)
- Procesos de negocio
- Algoritmos
- Flujos de trabajo
- Diagramas de decisión

### Diagramas de Base de Datos
- **Entidad-Relación (ER)**: Modelos de datos relacionales
- **Esquemas Normalizados**: Estructuras de BD optimizadas
- **Diagramas de Arquitectura**: Vistas de sistema

### Organigramas
- Estructuras organizacionales
- Jerarquías de equipos
- Cadenas de mando

### Diagramas de Secuencia
- Interacciones entre objetos
- Flujos de comunicación
- Procesos temporales

### Diagramas de Gantt
- Planificación de proyectos
- Cronogramas
- Gestión de tareas

### Diagramas de Clases
- Diseño de software
- Relaciones entre clases
- Arquitectura de aplicaciones

### Mind Maps
- Lluvia de ideas
- Mapas conceptuales
- Organización de información

## 🔧 Funcionalidades Principales

### Análisis Inteligente de Archivos

La aplicación puede procesar y analizar:

- **Imágenes**: Extrae información visual, texto y estructuras
- **Documentos de Texto**: Analiza contenido y estructura
- **Archivos CSV**: Interpreta datos tabulares

### Chat Interactivo

Características del sistema de chat:

- **Contexto Persistente**: Mantiene el historial de la conversación
- **Modificaciones Dinámicas**: Actualiza diagramas en tiempo real
- **Lenguaje Natural**: Comprende instrucciones conversacionales

### Gestión de Estado

- **Persistencia Local**: Guarda API Key y preferencias
- **Historial de Conversación**: Mantiene contexto entre sesiones
- **Manejo de Errores**: Sistema robusto de manejo de errores

## 📁 Estructura del Proyecto

```
myMermaidCharts/
├── index.html          # Archivo principal HTML
├── index.js            # Lógica de la aplicación
├── LICENSE             # Licencia de uso condicional
└── README.md           # Documentación del proyecto
```

### Componentes Principales

#### `index.html`
- Estructura completa de la interfaz
- Configuración de Tailwind CSS
- Importación de dependencias CDN
- Modales y componentes interactivos

#### `index.js`
- Integración con Google Gemini AI
- Manejo de archivos y drag & drop
- Sistema de chat interactivo
- Renderizado de diagramas Mermaid
- Exportación de contenido

## ⚖️ Licencia y Derechos de Autor

### 🚨 AVISO IMPORTANTE DE DERECHOS DE AUTOR

Este software es **propiedad intelectual exclusiva de Brayan Chan Pacheco**. Todos los derechos están reservados.

#### ❌ Restricciones de Uso

- **NO** se permite copiar, modificar o redistribuir el código
- **NO** se permite uso comercial sin autorización expresa
- **NO** se permite crear trabajos derivados
- **NO** se permite la redistribución parcial o total

#### ✅ Uso Permitido

- Uso personal para fines educativos o de aprendizaje
- Revisión del código para propósitos académicos
- Ejecución local de la aplicación

#### 📧 Solicitud de Permisos

Para cualquier uso que no esté expresamente permitido, **debes contactar al autor**:

**Brayan Chan Pacheco**
- 📧 Email: chanpachecob@gmail.com
- 🌐 Solicitudes de: Licencias comerciales, colaboraciones, uso institucional

#### ⚠️ Consecuencias del Uso No Autorizado

El uso no autorizado de este software puede resultar en:
- Acciones legales por violación de derechos de autor
- Solicitudes de cese y desistimiento
- Reclamaciones por daños y perjuicios

### Licencia Completa

Para los términos completos de la licencia, consulta el archivo `LICENSE` incluido en este proyecto.

## 🤝 Contacto

### Para Colaboraciones y Permisos

Si estás interesado en:
- **Licencias comerciales**
- **Colaboraciones en el proyecto**
- **Uso institucional o educativo**
- **Desarrollo de características personalizadas**
- **Consultoría técnica**

**Contacta directamente:**

**Brayan Chan Pacheco**
- 📧 **Email**: chanpachecob@gmail.com
- 🌍 **Ubicación**: Campeche, México
- 💼 **Especialidades**: Desarrollo web, IA, Desarrollo Móvil, Bases de Datos, Gestor de proyectos.

### Soporte Técnico

Para reportar bugs o solicitar funcionalidades:
1. Contacta por email con detalles específicos
2. Incluye capturas de pantalla si es relevante
3. Describe los pasos para reproducir el problema

---

## 🙏 Agradecimientos

Este proyecto fue desarrollado con dedicación y esfuerzo para proporcionar una herramienta útil para la creación de diagramas técnicos y profesionales.

**Gracias por respetar los derechos de autor y las condiciones de uso.**

---

**© 2025 Brayan Chan Pacheco. Todos los derechos reservados.**
