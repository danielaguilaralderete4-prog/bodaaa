# 🎭 GUÍA DE USO: EXPERIENCIA PADRINO/MADRINA

## 👑 ¿Qué es el Rol de Padrino/Madrina?

Es un **rol especial y de honor** en el matrimonio de Bárbara & Daniel. Los padrinos reciben:
- 🎁 Experiencia VIP exclusiva al abrir la invitación
- 💌 Petición formal y emotiva
- ✨ Animaciones elegantes con confeti dorado
- 🪑 Lugar de honor en la ceremonia y recepción
- 👗 Coordinación especial de vestuario

---

## 📝 PARA LOS NOVIOS: Cómo Designar Padrinos

### Paso 1️⃣: Abrir Panel de Administración

```
En la página de invitación:
  ↓
  Header → Botón "Panel Novios"
  ↓
  Ingresar contraseña de administrador
```

### Paso 2️⃣: Buscar Invitado

```
Panel Abierto:
  ↓
  Pestaña: "Invitados" (por defecto)
  ↓
  Buscar nombre/código en buscador
  ↓
  Ver en tabla principal
```

### Paso 3️⃣: Marcar como Padrino

En la tabla de invitados, buscar la fila del invitado:

```
📊 VISTA GENERAL DE LA TABLA:

┌─────────────────────────────────────────────────────────┐
│ Código │ Invitado/Familia │ Categoría │ Cupos │ Acciones │
├─────────────────────────────────────────────────────────┤
│ BD-234 │ Daniel Morales   │ Familia   │ 2     │          │
│        │ ☑️ Teléfono     │           │       │          │
│        │ [+ Marcar Padrino] ← AQUÍ CLICK  │          │
└─────────────────────────────────────────────────────────┘

ANTES:  "+ Marcar Padrino"     (botón blanco)
  ↓
DESPUÉS: "★ Padrino Asignado"   (botón dorado/amber)
```

**Estados del Botón:**
- 🔲 **Blanco:** No es padrino
- ⭐ **Dorado:** Padrino asignado
- Junto al nombre: 👑 **"Padrino/Madrina"** (badge)

### Paso 4️⃣: Compartir Enlace Exclusivo

Una vez marcado como padrino, buscar botones de compartir:

```
OPCIONES DE COMPARTIR:
├─ 📋 Copiar Enlace  ← La URL incluye ?padrino=true
├─ 💬 WhatsApp       ← Mensaje personalizado
└─ 📧 Email          ← (si está disponible)
```

**La URL será:**
```
https://www.invitacion.com/?invitado=Daniel+Morales&padrino=true
```

**Mensaje WhatsApp Personalizado:**
```
¡Hola Daniel! ✨

Con todo nuestro amor, admiración y cariño, Bárbara y Daniel 
queremos hacerles una petición muy especial en nuestro camino 
al matrimonio el 12 de Diciembre de 2026. 

Por favor abran este enlace exclusivo que preparamos para ustedes:

[ENLACE CON ?padrino=true]
```

### Paso 5️⃣: Ver Respuesta de Padrino

En el Panel, la fila del padrino mostrará:

```
ESTADOS DE RESPUESTA:

👑 Aceptó Padrino         ← Aceptó el rol
├─ Color: Verde/Amber
├─ Confirmado: Sí
└─ Cupos: Confirmados

Asiste (No Padrino)       ← Rechazó rol pero viene
├─ Color: Neutro/Gris
├─ Confirmado: Sí
└─ Cupos: Confirmados

Padrino sin definir       ← Aún no responde
├─ Color: Amarillo suave
├─ Confirmado: No
└─ Cupos: Pendientes
```

---

## 👑 PARA LOS PADRINOS: Experiencia Completa

### ¿Qué Recibirás?

```
Mensaje: "¡Hola Daniel! ✨"
   ↓
Enlace especial con ?padrino=true
   ↓
"ABRE ESTE ENLACE"
```

### Experiencia en 3 Pasos

---

## **PASO A: LA PETICIÓN ESPECIAL** (Sobre/Modal)

**¿Qué ves?**

```
┌──────────────────────────────────────────────────────────┐
│                    [X]  (cierra si quieres)             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  👑 INVITACIÓN DE HONOR VIP                        │ │
│  │                                                    │ │
│  │            🎭 Sello dorado elegante 🎭            │ │
│  │                  B & D (Monograma)                │ │
│  │                                                    │ │
│  │  Una petición muy especial                        │ │
│  │                                                    │ │
│  │        ¡Hola Daniel & María!                      │ │
│  │                                                    │ │
│  │  ╔═══════════════════════════════════════════════╗│ │
│  │  ║ "Para nosotros este día no estaría           ║│ │
│  │  ║  completo sin ustedes a nuestro lado.         ║│ │
│  │  ║  No solo los invitamos a ser parte de nuestro║│ │
│  │  ║  matrimonio, queremos pedirles formalmente   ║│ │
│  │  ║  que sean nuestros padrinos."                ║│ │
│  │  ║                                               ║│ │
│  │  ║  ❤️ Con todo nuestro cariño,                  ║│ │
│  │  ║  Bárbara & Daniel                            ║│ │
│  │  ╚═══════════════════════════════════════════════╝│ │
│  │                                                    │ │
│  │  ┌────────────────────────────────────────────┐  │ │
│  │  │ 👑 ¡Acepto ser Padrino/Madrina!           │  │ │
│  │  │           (Botón Dorado Grande) ✨         │  │ │
│  │  └────────────────────────────────────────────┘  │ │
│  │                                                    │ │
│  │  ⭕ Acepto asistir (No como padrino)             │ │
│  │  ❌ Lamentablemente no podré asistir             │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘

ACCIÓN:
  → Click en "¡Acepto ser Padrino/Madrina!"
  → Se registra inmediatamente
  → Base de datos actualiza: acepto_padrino = true
  → Panel de novios ve: "👑 Aceptó Padrino"
```

---

## **PASO B: CELEBRACIÓN VIP** (3 Segundos)

**¿Qué ves?**

```
Animación Suave:

  ┌──────────────────────────────────────────┐
  │          Confeti dorado elegante ✨     │
  │                                          │
  │        ┌──────────────────────────┐     │
  │        │      👑  Brillando      │     │
  │        └──────────────────────────┘     │
  │                                          │
  │  ¡Bienvenidos Padrinos!                 │
  │                                          │
  │  Daniel & María                         │
  │                                          │
  │  Es un inmenso honor tener su bendición │
  │  en este momento tan sagrado...         │
  │                                          │
  │                   Abriendo invitación   │
  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  3s  │
  │                                          │
  │    [O CONTINUAR AHORA →]                │
  │                                          │
  └──────────────────────────────────────────┘

DURACIÓN: 3 segundos (puedes saltar si quieres)
MÚSICA: Suave y elegante
EFECTO: Glow dorado, confeti sutil
```

---

## **PASO C: INVITACIÓN COMPLETA + SECCIÓN VIP**

**Después de 3 segundos, scroll automático:**

```
┌─────────────────────────────────────────────────────────────┐
│                 HERO SECTION (Invitación Principal)         │
│                                                             │
│                  Bárbara & Daniel                           │
│                        12 de Diciembre de 2026              │
│                                                             │
│              [Continuar viendo detalles]                    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│         🎭 SU ROL ESPECIAL COMO PADRINOS 👑                │
│  ╔═════════════════════════════════════════════════════╗   │
│  ║    SECCIÓN EXCLUSIVA DE HONOR                       ║   │
│  ║                                                     ║   │
│  ║  El siguiente es contenido SOLO para ustedes:     ║   │
│  │                                                     ║   │
│  │  ┌─────────────────────────────────────────┐       │   │
│  │  │ 👗 COORDINACIÓN Y ESTILO              │       │   │
│  │  │ ─────────────────────────────────────  │       │   │
│  │  │ Deseamos que brillen junto a nosotros │       │   │
│  │  │ en las fotografías oficiales del      │       │   │
│  │  │ cortejo. En las próximas semanas nos  │       │   │
│  │  │ pondremos en contacto para sugerirles │       │   │
│  │  │ la paleta armónica de colores.        │       │   │
│  │  └─────────────────────────────────────┘       │   │
│  │                                                     ║   │
│  │  ┌─────────────────────────────────────┐       │   │
│  │  │ ⏰ LLEGADA ANTICIPADA              │       │   │
│  │  │ ─────────────────────────────────────  │       │   │
│  │  │ Les solicitamos llegar 30 minutos     │       │   │
│  │  │ antes (17:30 hrs) al recinto para     │       │   │
│  │  │ realizar la sesión de fotos familiares│       │   │
│  │  │ y estar juntos antes del inicio de    │       │   │
│  │  │ la ceremonia.                         │       │   │
│  │  └─────────────────────────────────────┘       │   │
│  │                                                     ║   │
│  │  ┌─────────────────────────────────────┐       │   │
│  │  │ ⭐ LUGAR EN EL ALTAR              │       │   │
│  │  │ ─────────────────────────────────────  │       │   │
│  │  │ Tendrán asientos de honor reservados  │       │   │
│  │  │ en la primera fila de la ceremonia y  │       │   │
│  │  │ en la mesa principal para acompañarnos│       │   │
│  │  │ con su bendición en todo momento.     │       │   │
│  │  └─────────────────────────────────────┘       │   │
│  │                                                     ║   │
│  │  ┌─────────────────────────────────────┐       │   │
│  │  │ ❤️  ¡Gracias por aceptar acompañarnos│       │   │
│  │  │     y ser parte fundamental de        │       │   │
│  │  │     nuestro gran día!                 │       │   │
│  │  └─────────────────────────────────────┘       │   │
│  ║                                                     ║   │
│  ╚═════════════════════════════════════════════════════╝   │
│                                                             │
│  Continuar → RSVP y Detalles de la Invitación             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**En la sección RSVP:**

```
┌─────────────────────────────────────────────────┐
│  👑 INVITACIÓN DE HONOR: PADRINOS DE MATRIMONIO│
│                                                  │
│  ✅ Su confirmación como Padrinos y asistencia │
│     ya está registrada!                         │
│                                                  │
│  A continuación pueden actualizar los nombres   │
│  de los asistentes o dejarnos un mensaje       │
│  especial.                                      │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. ¿Podrá acompañarnos?                  │  │
│  │    ✅ Sí, asistiré con alegría (PRESELEC│  │
│  │                                          │  │
│  │ 2. Nombres de quienes asistirán:        │  │
│  │    [Daniel Morales]                      │  │
│  │    [María Pérez]                         │  │
│  │                                          │  │
│  │ 3. Datos de contacto:                   │  │
│  │    Teléfono: [+56 9 1234 5678]          │  │
│  │    Email: daniel@email.com (opcional)    │  │
│  │                                          │  │
│  │ 4. Mensaje para Bárbara & Daniel:       │  │
│  │    [✏️ Escribir mensaje...]              │  │
│  │                                          │  │
│  │    [ENVIAR CONFIRMACIÓN]                 │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## ✅ Lo Que Sucede Detrás

```
CUANDO HACES CLICK EN "¡Acepto ser Padrino/Madrina!":

  1. Sistema registra inmediatamente:
     ✓ Tu nombre (detectado de la URL)
     ✓ Estado: acepto_padrino = true
     ✓ Hora de confirmación
     ✓ Mensaje: "¡Aceptamos con inmenso amor..."

  2. En la Base de Datos (Firebase):
     guests/tu-id/
       ├─ es_padrino: true ✓
       ├─ acepto_padrino: true ✓ ← IMPORTANTE
       ├─ asistira: true ✓
       ├─ confirmado: true ✓
       └─ fecha_confirmacion: 2026-10-01T...

  3. En el Panel de los Novios:
     ✓ Tu nombre aparece con badge: 👑 Padrino/Madrina
     ✓ Estado: "👑 Aceptó Padrino"
     ✓ Color: Verde/Amber (destacado)
     ✓ Cupos: Confirmados

  4. Sistema te muestra:
     ✓ Animación de celebración (3 segundos)
     ✓ Scroll automático a sección de honor
     ✓ Información especial como padrino
```

---

## 🚫 Si Quieres Cambiar de Opinión

```
OPCIÓN A: Aceptar pero sin rol de padrino
  → Click: "Acepto asistir (No como padrino)"
  → Resultado: asistira=true, acepto_padrino=false
  → Panel mostrará: "Asiste (No Padrino)"

OPCIÓN B: No poder asistir
  → Click: "Lamentablemente no podré asistir"
  → Resultado: asistira=false, acepto_padrino=false
  → Panel mostrará: "No Asiste"

OPCIÓN C: Después en el RSVP
  → Completa el formulario nuevamente
  → Contacta a los novios directamente
  → Ellos pueden cambiar tu estado en el panel
```

---

## 📱 ¿Funciona en Móvil?

```
✅ SÍ, 100% Responsivo

MÓVIL:
├─ Modal se adapta al tamaño
├─ Botones más grandes para tocar
├─ Textos se ajustan
├─ Confeti es elegante (no pesado)
├─ Animaciones fluidas

TABLET:
├─ Experiencia equilibrada
├─ Muy legible
├─ Buen espacio

DESKTOP:
├─ Experiencia completa
├─ Todas las animaciones
└─ Mejor visual
```

**Prueba desde:**
- iPhone, iPad
- Android
- Navegador de desktop

---

## 🎨 Reconocerás los Elementos Padrino Por:

| Elemento | Visual | Significado |
|----------|--------|------------|
| 👑 Corona | Icono pequeño | Es padrino |
| Dorado (#D4AF37) | Colores cálidos | Sección VIP |
| Badge Amber | Fondo amber claro | Información especial |
| ⭐ Estrella | Ícono destacado | Padrino confirmado |
| Confeti ✨ | Animación sutil | Celebración |
| Borde Dorado | Línea 2px | Marco especial |

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si no hago clic en ninguna opción?**
A: Puedes cerrar el modal (botón X) y la experiencia se guarda. Luego completar en RSVP.

**P: ¿Aparece cada vez que abro el enlace?**
A: No, una vez que respodes, se guarda en sesión. No volverá a aparecer.

**P: ¿Puedo recibir el enlace sin parámetro padrino?**
A: Sí, pero verás la invitación normal sin la experiencia VIP.

**P: ¿Quién más ve mi confirmación como padrino?**
A: Solo los novios en su panel de administración.

**P: ¿Debo ir con vestuario especial?**
A: Sí, se coordina después. Los novios se contactarán contigo.

---

## 💝 Resumen

Como **Padrino/Madrina** recibirás:

✅ Experiencia VIP única y emotiva  
✅ Reconocimiento en la invitación  
✅ Lugar de honor en ceremonia y recepción  
✅ Coordinación especial de vestuario  
✅ Mensaje personalizado de los novios  
✅ Recordatorios especiales  
✅ ¡Ser parte fundamental del gran día!

---

**¡Gracias por aceptar este honor!**

Con todo nuestro cariño,  
**Bárbara & Daniel**  
12 de Diciembre de 2026
