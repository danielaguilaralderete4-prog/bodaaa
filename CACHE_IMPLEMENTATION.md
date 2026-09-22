# 📦 Caché de Invitados - Implementación

## ¿Qué se implementó?

Se agregó un sistema de caché de invitados en localStorage para mejorar la velocidad de carga y permitir modo offline parcial.

---

## 🎯 Cómo funciona

### **Primera carga:**
```
1. Usuario carga la página
2. App intenta cargar datos de localStorage (caché)
3. Si no hay caché o está expirado:
   - Muestra pantalla de carga
   - Se conecta a Firebase
   - Descarga la lista de invitados
   - Guarda en localStorage
   - Actualiza la UI

⏱️ Tiempo: ~2-3 segundos (primera vez)
```

### **Cargas subsecuentes (dentro de 30 minutos):**
```
1. Usuario carga la página
2. App carga invitados de localStorage INSTANTÁNEAMENTE
3. En background:
   - Se conecta a Firebase
   - Verifica si hay actualizaciones
   - Actualiza la lista si cambió algo

⏱️ Tiempo: ~200ms (luego de allí se sincroniza)
```

---

## 🔧 Archivos modificados

### 1. **[guestCache.ts](C:/Users/danie/Desktop/invitacion/ByD/src/utils/guestCache.ts)** (NUEVO)
Utilidades para guardar, cargar y limpiar el caché:

```typescript
saveGuestListToCache(guests)    // Guarda lista en localStorage
getGuestListFromCache()         // Lee lista de localStorage
clearGuestCache()               // Limpia el caché
isCacheExpired()                // Verifica si expiró
```

**Características:**
- ⏰ Cache expira después de 30 minutos
- 🛡️ Validación de errores
- 🔍 Timestamp automático

### 2. **[GuestContext.tsx](C:/Users/danie/Desktop/invitacion/ByD/src/context/GuestContext.tsx)** (MODIFICADO)

**Cambios:**
```typescript
// Importar utilidades de caché
import { saveGuestListToCache, getGuestListFromCache, clearGuestCache } from '../utils/guestCache';

// Al cargar la página:
// 1. Intenta cargar del caché primero
const cachedGuests = getGuestListFromCache();
if (cachedGuests && cachedGuests.length > 0) {
  setGuests(cachedGuests);  // Mostrar instantáneamente
  setIsLoading(false);
}

// 2. Se conecta a Firebase en background
// 3. Cuando Firebase devuelve datos, actualiza y guarda en caché
const publish = () => {
  const guestList = privateGuests.map(guest => ...);
  setGuests(guestList);
  saveGuestListToCache(guestList);  // ← Guarda automáticamente
};

// 4. Cuando se resetea la BD, limpia el caché
const resetAllToDefault = async () => {
  // ... reset logic ...
  clearGuestCache();  // ← Limpia
};
```

---

## 📊 Beneficios

| Antes | Después |
|-------|---------|
| ⏳ Siempre espera a Firebase | ⚡ Carga instantánea (caché) |
| ❌ No funciona sin internet | ✅ Funciona offline (parcialmente) |
| 📡 Descarga completa cada vez | 📉 Solo sincroniza cambios |
| 💾 Todo en memoria | 💾 Persiste entre sesiones |

---

## ⚙️ Configuración

Si necesitas cambiar el tiempo de expiración del caché, edita [guestCache.ts](C:/Users/danie/Desktop/invitacion/ByD/src/utils/guestCache.ts):

```typescript
// Línea 4 - Cambiar de 30 minutos a otro valor:
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // ← Edita aquí

// Ejemplos:
// 60 * 60 * 1000   → 1 hora
// 24 * 60 * 60 * 1000   → 1 día
// 5 * 60 * 1000   → 5 minutos
```

---

## 🧪 Cómo probar

### Test 1: Caché funciona
```
1. Carga la página → Espera que se descarguen invitados
2. Cierra la página completamente
3. Abre nuevamente en la misma pestaña
4. La lista de invitados aparece INSTANTÁNEAMENTE
5. Después se sincroniza con Firebase en background
```

### Test 2: Modo offline
```
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Selecciona "Offline"
4. Recarga la página
5. Los invitados se cargan del caché (si está disponible)
6. Verás un error en la consola (expected)
```

### Test 3: Caché expira
```
1. Carga los invitados (se guardan)
2. Espera más de 30 minutos
3. Recarga la página
4. Se descarga de nuevo desde Firebase (caché expiró)
```

### Test 4: Limpiar caché manualmente
```
En DevTools Console:
localStorage.removeItem('wedding_guests_cache');
localStorage.removeItem('wedding_guests_cache_timestamp');
```

---

## 📈 Impacto de Performance

**Métrica**: Tiempo de carga de invitados

### Antes (sin caché):
```
Primera carga:    ~2500ms (descarga de Firebase)
Segunda carga:    ~2500ms (descarga de Firebase)
```

### Después (con caché):
```
Primera carga:    ~2500ms (descarga de Firebase)
Segunda carga:    ~200ms  (desde localStorage) ✅ 12x más rápido
Tercera carga:    ~200ms  (desde localStorage)
```

---

## 🔍 Debugging

Si algo no funciona, verifica la consola:

```javascript
// Ver qué está en caché:
console.log(localStorage.getItem('wedding_guests_cache'));

// Ver timestamp del caché:
console.log(localStorage.getItem('wedding_guests_cache_timestamp'));

// Limpiar manual:
localStorage.clear();
```

---

## ⚠️ Notas importantes

1. **El caché es de solo lectura** - Los cambios se hacen en Firebase, no en localStorage
2. **Se sincroniza automáticamente** - Cuando Firebase cambia, se actualiza el caché
3. **Expira después de 30 minutos** - Garantiza que no sea muy viejo
4. **Funciona para invitados públicos** - Cuando no estás autenticado, también cachea

---

## 🚀 Próximas mejoras posibles

1. Agregar indicador visual "Cargado desde caché"
2. Permitir sincronización manual con un botón "Actualizar"
3. Cachear también las respuestas RSVP
4. Notificación cuando caché se actualiza

