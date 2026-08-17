# 🌊 Focus Wave

> **Tu espacio de sonido ambiental, concentración y calma.**  
> 🔗 **Aplicación en vivo:** [https://focus-wave.pages.dev](https://focus-wave.pages.dev)

![Focus Wave PWA](https://focus-wave.pages.dev/icon.svg)

**Focus Wave** es una Progressive Web App (PWA) de productividad y bienestar diseñada para crear la atmósfera perfecta de estudio, programación, lectura y relajación profunda.

---

## ✨ Características Principales

### 🎧 1. Mezclador de Sonidos Ambientales en Tiempo Real
- **Síntesis de Audio Nativa con Web Audio API**: No requiere descargar pesados archivos MP3 ni depender de conexiones a internet lentas. Todos los sonidos se sintetizan algorítmicamente en tiempo real en tu dispositivo.
- **Sonidos Disponibles**:
  - 🌧️ **Lluvia Serena**: Gotas constantes y relajantes.
  - ⚡ **Truenos Lejanos**: Retumbos atmosféricos y ecos lejanos diseñados con presencia equilibrada para celulares y audífonos.
  - 🔥 **Chimenea Acogedora**: Crepitar orgánico de leña, brasas ardientes y calidez envolvente.
  - ☕ **Cafetería Zen**: Murmullo ambiental suave de salón de café.
  - 🌊 **Olas del Océano**: Mareas rítmicas con modulación LFO continua.
  - 🌲 **Bosque Nocturno**: Grillos y brisa nocturna relajante.
  - 💨 **Viento Suave**: Brisa continua y silbidos tenues.
  - 📻 **Ruido Blanco, Rosa y Marrón**: Bloqueadores de distracción auditiva.
  - 🧠 **Ondas Binaurales**: Frecuencias alfa y theta para enfoque profundo.
- **Preajustes Rápidos**: *Lluvia y Truenos*, *Noche de Lectura*, *Café Productivo*, *Enfoque Profundo* y *Meditación Zen*.
- **Control de Volumen Individual y Maestro**: Ajuste de balance fino por cada canal.

### ⏱️ 2. Temporizador Pomodoro
- Intervalos configurables de Enfoque (25 min), Descanso Corto (5 min) y Descanso Largo (15 min).
- Alertas sonoras armónicas al finalizar cada sesión (acorde de cuenco tibetano).
- Contador de sesiones completadas.

### 🫁 3. Ejercicio de Respiración Guiada (4-7-8)
- Animación visual expansiva para sincronizar la inhalación, retención y exhalación.
- Asistente para reducir la ansiedad y aumentar la claridad mental en pausas de trabajo.

### 📝 4. Lista de Tareas y Objetivos (Todo List)
- Organización rápida de tareas prioritarias.
- Marcar como completadas, filtrar por estado y persistencia automática en almacenamiento local.

### 🎨 5. Temas Visuales y Modo Zen
- 5 paletas de color con estética minimalista Lofi: *Cyber Cyan*, *Sunset Amber*, *Emerald Forest*, *Purple Mist* y *Rose Quartz*.
- Modo Pantalla Completa Zen para eliminar distracciones.

---

## 📱 Listo para Instalar como PWA (Offline-First)

Focus Wave cumple con todos los estándares modernos de **Progressive Web App**:
- **100% Funcional Sin Conexión**: La síntesis de sonido se ejecuta de forma autónoma en el navegador.
- **Instalable en Móviles y Escritorio**:
  - **Android (Chrome/Edge)**: Presiona el botón *"Instalar aplicación"* o el menú del navegador.
  - **iOS (Safari)**: Presiona el botón *Compartir* > *"Agregar a la pantalla de inicio"*.
  - **macOS/Windows**: Presiona el icono de instalación en la barra de direcciones del navegador.

---

## 🚀 Tecnologías Utilizadas

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Web Audio API** (Osciladores, Filtros Biquad, Nodos Gain, Generadores de Ruido)
- **Lucide Icons**
- **Service Workers & Web App Manifest**

---

## 🛠️ Instalación y Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/focus-wave.git
   cd focus-wave
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 🌐 Despliegue en Cloudflare Pages

El proyecto está optimizado para compilar directamente en **Cloudflare Pages**:
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **URL de producción**: [https://focus-wave.pages.dev](https://focus-wave.pages.dev)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
Focus Wave © 2026.
