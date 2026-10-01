# 🔧 REFERENCIA TÉCNICA: IMPLEMENTACIÓN PADRINO/MADRINA

## 📚 Índice de Archivos

### Archivos Principales Modificados

#### 1. **src/App.tsx** (Principal)
- **Cambios:** Integración del PadrinosVIPExperience
- **Líneas:** ~15 líneas añadidas/modificadas
- **Funciones:**
  - `isPadrinoVIP`: Estado para detectar VIP
  - `isPadrinoUnlocked`: State para bloqueo VIP
  - `useEffect` para detectar parámetro URL
  - Render de `<PadrinosVIPExperience />`
  - Render condicional de `<PadrinosSpecialRoleSection />`

```typescript
const [isPadrinoVIP, setIsPadrinoVIP] = useState(false);
const [isPadrinoUnlocked, setIsPadrinoUnlocked] = useState(false);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const isPadrino = params.get('padrino') === 'true' || params.get('padrino') === '1';
  setIsPadrinoVIP(isPadrino && !isPadrinoUnlocked);
}, [isPadrinoUnlocked]);
```

---

#### 2. **src/components/Header.tsx**
- **Cambios:** Añadir prop `isPadrinoVIP` y mostrar badge
- **Líneas:** ~5 líneas nuevas
- **Función:** Mostrar badge dorado de padrino en header

```typescript
interface HeaderProps {
  isAdminOpen: boolean;
  onToggleAdmin: () => void;
  isPadrinoVIP?: boolean;  // ← NUEVO
}

// Dentro del return:
{isPadrinoVIP && (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 
                  rounded-full bg-amber-50 border border-[#D4AF37]">
    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
    <span className="hidden sm:inline">Padrinos de Matrimonio</span>
  </div>
)}
```

---

#### 3. **src/components/RSVPSection.tsx**
- **Cambios:** Importar PadrinosSpecialRoleSection, mejorar dropdown
- **Líneas:** ~30 líneas modificadas
- **Funciones:**
  - Mostrar badge "👑 Padrino" en dropdown
  - Banner especial para padrinos
  - Estados pre-rellenados

```typescript
// Importación
import { PadrinosSpecialRoleSection } from './PadrinosSpecialRoleSection';

// En dropdown:
{g.es_padrino && (
  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 
                   px-1.5 py-0.5 rounded border border-amber-300">
    👑 Padrino
  </span>
)}

// Banner en formulario:
{selectedGuest.es_padrino && (
  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r 
                  from-amber-50 via-[#FFFDF7] to-amber-50 
                  border-2 border-[#D4AF37]">
    <Crown className="w-5 h-5 text-[#D4AF37]" />
    <p className="text-sm font-bold text-[#18243D]">
      👑 Invitación de Honor: Padrinos de Matrimonio
    </p>
  </div>
)}
```

---

#### 4. **src/components/AdminDashboard.tsx**
- **Cambios:** Corregir estructura JSX, toggle de padrino
- **Líneas:** ~10 líneas corregidas
- **Funciones:**
  - Toggle para marcar/desmarcar padrinos
  - Filtro especial de padrinos
  - Indicadores visuales en tabla

```typescript
// Toggle funcional:
<button type="button" 
  onClick={() => updateGuest(g.id, { es_padrino: !g.es_padrino })}>
  {g.es_padrino ? '★ Padrino Asignado' : '+ Marcar Padrino'}
</button>

// Filtro:
<button onClick={() => setFilterStatus('padrinos')} 
  className="...">
  👑 Padrinos ({guests.filter((g) => g.es_padrino).length})
</button>

// Estados en tabla:
{g.acepto_padrino === true && (
  <span className="bg-amber-100 text-amber-900">
    👑 Aceptó Padrino
  </span>
)}
```

---

### Archivos No Modificados (Ya Existentes)

#### 5. **src/types.ts**
- **Campos existentes:**
  ```typescript
  interface Guest {
    es_padrino?: boolean;
    acepto_padrino?: boolean | null;
  }
  ```

#### 6. **src/context/GuestContext.tsx**
- **Métodos existentes:**
  - `submitRSVP()` - Maneja `acepto_padrino`
  - `responderPadrino()` - Especializado para padrinos

#### 7. **src/components/PadrinosVIPExperience.tsx**
- **Completamente implementado** con:
  - Paso A: Modal de petición
  - Paso B: Celebración (3s)
  - Paso C: Desbloqueo

#### 8. **src/components/PadrinosSpecialRoleSection.tsx**
- **Completamente implementado** con:
  - Tres tarjetas de información
  - Estilos dorados
  - Contenido personalizado

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│ USUARIO PADRINO ABRE ENLACE                             │
│ ?invitado=Nombre&padrino=true                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ App.tsx detecta     │
         │ parámetro padrino   │
         │ isPadrinoVIP = true │
         └────────┬────────────┘
                  │
                  ▼
      ┌────────────────────────────────┐
      │ PadrinosVIPExperience          │
      │ Renderiza Modal (Paso A)       │
      │ Petición Especial              │
      └────────┬─────────────────────────┘
               │
          ┌────┴────────────────────────────────┐
          │                                     │
    ACEPTA PADRINO                   NO ACEPTA/OTRA OPCIÓN
    ▼                                 ▼
GuestContext.submitRSVP()         GuestContext.submitRSVP()
{                                 {
  acepto_padrino: true              acepto_padrino: false/null
  asistira: true                    asistira: true/false
}                                 }
    │                               │
    ▼                               ▼
Firebase Realtime DB              Firebase Realtime DB
actualiza:                         actualiza:
guests/{id}                        guests/{id}
guestResponses/{...}              guestResponses/{...}
    │                               │
    ├───────────────┬───────────────┤
                    │
                    ▼
    ┌─────────────────────────────┐
    │ Estado actualiza            │
    │ isPadrinoUnlocked = true    │
    │ Renderiza Paso B (3s)       │
    └────────┬────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Animación de celebración     │
    │ - Confeti                    │
    │ - Corona brillante           │
    │ - Mensaje: "¡Bienvenidos!"   │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Paso C: Scroll automático    │
    │ Muestra:                     │
    │ - PadrinosSpecialRoleSection │
    │ - Info: Vestuario, horarios  │
    │ - RSVPSection pre-rellenado  │
    └──────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Panel Admin (Novios)         │
    │ Ve: "👑 Aceptó Padrino"     │
    │ Status: CONFIRMADO           │
    └──────────────────────────────┘
```

---

## 📱 Estados React

### En App.tsx
```typescript
const [isPadrinoVIP, setIsPadrinoVIP] = useState(false);
const [isPadrinoUnlocked, setIsPadrinoUnlocked] = useState(false);
```

**isPadrinoVIP:**
- `true`: URL contiene `?padrino=true` Y usuario no ha respondido
- `false`: URL no tiene parámetro O ya respondió
- **Efecto:** Muestra modal y badge VIP

**isPadrinoUnlocked:**
- `false`: Usuario aún no ha respondido
- `true`: Usuario respondió (cualquier opción)
- **Efecto:** Oculta modal, muestra PadrinosSpecialRoleSection

---

## 🗄️ Estructura de Base de Datos

### guests/{guestId}
```json
{
  "id": "g-1696185600000",
  "codigo_invitacion": "INV-TS7HKN",
  "nombre_principal": "Daniel Morales",
  "cupos_totales": 2,
  "confirmado": false,
  "asistira": null,
  "es_padrino": true,              // ← NUEVO
  "acepto_padrino": null,          // ← NUEVO
  "cupos_confirmados": 0,
  "asistentes_nombres": [],
  "mensaje_novios": "",
  "telefono": "+56 9 1234 5678",
  "email": "daniel@email.com",
  "mesa_asignada": "Mesa 1",
  "categoria": "Familia Novio",
  "fecha_confirmacion": null
}
```

### guestResponses/{responseId}
```json
{
  "guest_id": "g-1696185600000",
  "confirmado": true,
  "asistira": true,
  "cupos_confirmados": 2,
  "asistentes_nombres": ["Daniel Morales", "María Pérez"],
  "mensaje_novios": "¡Aceptamos con inmenso amor ser sus padrinos!",
  "acepto_padrino": true,          // ← NUEVO
  "fecha_confirmacion": "2026-10-01T15:30:00Z"
}
```

### guestDirectory/{guestId}
```json
{
  "codigo_invitacion": "INV-TS7HKN",
  "nombre_principal": "Daniel Morales",
  "cupos_totales": 2,
  "es_padrino": true,              // ← NUEVO
  "acepto_padrino": null,          // ← NUEVO
  "confirmado": false,
  "asistira": null,
  "cupos_confirmados": 0
}
```

---

## 🔑 Funciones Clave del Contexto

### GuestContext.submitRSVP()
```typescript
submitRSVP(guestId: string, data: {
  asistira: boolean;
  cupos_confirmados: number;
  asistentes_nombres: string[];
  mensaje_novios?: string;
  acepto_padrino?: boolean | null;  // ← NUEVO
}): Promise<{success, message, guest}>
```

**Lógica especial para padrinos:**
```typescript
acepto_padrino: data.acepto_padrino !== undefined
  ? data.acepto_padrino
  : targetGuest.acepto_padrino !== undefined
    ? targetGuest.acepto_padrino
    : targetGuest.es_padrino && data.asistira
      ? true
      : null,
```

### GuestContext.responderPadrino()
```typescript
responderPadrino(guestId: string, acepta: boolean): 
  Promise<{success, message, guest}>
```

**Usa internamente submitRSVP() con:**
```typescript
submitRSVP(guestId, {
  asistira: true,
  cupos_confirmados: targetGuest.cupos_totales,
  asistentes_nombres: [...],
  mensaje_novios: acepta ? 
    '¡Aceptamos con inmenso amor ser sus padrinos!' :
    'Asistiremos con alegría como invitados.',
  acepto_padrino: acepta
})
```

---

## 🎨 Constantes de Estilo

### Colores Padrino
```typescript
const PADRINO_COLORS = {
  gold: '#D4AF37',        // Oro principal
  darkGold: '#BC986A',    // Oro oscuro
  lightGold: '#F3E5AB',   // Oro suave
  darkBg: '#18243D',      // Azul oscuro para títulos
  lightBg: '#FAF8F2',     // Crema
  amberbg: '#FAF8F2',     // Fondo amber suave
};
```

### Classes Tailwind Padrino
```typescript
// Badge
className="inline-flex items-center gap-1.5 px-3 py-1 
           rounded-full bg-amber-50 border border-[#D4AF37] 
           text-amber-950"

// Banner
className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r 
           from-amber-50 via-[#FFFDF7] to-amber-50 
           border-2 border-[#D4AF37]"

// Button
className="bg-gradient-to-r from-[#D4AF37] via-[#C5A028] 
           to-[#B89A62] text-[#18243D] 
           shadow-[0_8px_25px_rgba(212,175,55,0.4)]"
```

---

## 🔐 Validaciones

### En AdminDashboard.handleAddSubmit()
```typescript
const res = await addGuest({
  // ... otros campos
  es_padrino: newIsPadrino,
  acepto_padrino: null  // Siempre null al crear
});
```

### En GuestContext.updateGuest()
```typescript
await updateGuest(id, {
  nombre_principal: editingGuest.nombre_principal,
  // ... otros campos
  es_padrino: Boolean(editingGuest.es_padrino),  // Force boolean
});
```

### En PadrinosVIPExperience.handleAcceptPadrino()
```typescript
if (identifiedGuest) {
  await submitRSVP(identifiedGuest.id, {
    asistira: true,
    cupos_confirmados: identifiedGuest.cupos_totales,
    acepto_padrino: true  // ← CRÍTICO
  });
}
```

---

## 🐛 Debugging

### Para verificar estado padrino:
```javascript
// En consola del navegador
const params = new URLSearchParams(window.location.search);
console.log('isPadrino:', params.get('padrino')); // 'true' o null

// En Firebase Console
// Path: guests/{guestId}/es_padrino → debe ser true
// Path: guests/{guestId}/acepto_padrino → true/false/null
```

### Para verificar sincronización:
```javascript
// En Admin Dashboard
// Tabla debe mostrar:
// 1. Badge: 👑 Padrino/Madrina (si es_padrino=true)
// 2. Toggle: ★ Padrino Asignado (si es_padrino=true)
// 3. Estado: 👑 Aceptó Padrino (si acepto_padrino=true)
```

---

## 🚀 Optimizaciones Futuras

### Performance
- [ ] Lazy load de PadrinosVIPExperience
- [ ] Memoization de componentes padrino
- [ ] Code splitting en PadrinosSpecialRoleSection

### Funcionalidad
- [ ] Sistema de notificaciones push para padrinos
- [ ] Coordinador de vestuario en línea
- [ ] Galería exclusiva post-evento

### UX/UI
- [ ] Animaciones más complejas (threejs)
- [ ] Soporte para múltiples idiomas
- [ ] Dark mode para padrinos

---

## 📞 Soporte para Desarrolladores

### Preguntas Comunes

**P: ¿Cómo agregar un nuevo campo a padrinos?**
A: 
1. Agregar a `types.ts` → `Guest`
2. Actualizar `GuestContext.tsx` → `submitRSVP()`
3. Guardar en Firebase → `guestResponses`
4. Mostrar en componente → `RSVPSection.tsx` o `AdminDashboard.tsx`

**P: ¿Cómo cambiar el flujo de 3 pasos?**
A: Editar `PadrinosVIPExperience.tsx` → variable `currentStep`

**P: ¿Cómo modificar estilos dorados?**
A: Buscar `#D4AF37` en archivos y reemplazar con nuevo color

**P: ¿Cómo agregar más información en sección de padrinos?**
A: Editar `PadrinosSpecialRoleSection.tsx` → agregar tarjeta

---

## 📊 Checklist de Implementación

- ✅ Types definidos en types.ts
- ✅ GuestContext con métodos
- ✅ PadrinosVIPExperience completamente funcional
- ✅ PadrinosSpecialRoleSection con contenido
- ✅ App.tsx integrado
- ✅ Header con badge
- ✅ RSVPSection mejorado
- ✅ AdminDashboard con toggle
- ✅ Firebase esquema actualizado
- ✅ Build exitoso
- ✅ Documentación completa

---

**Última Actualización:** 01 de Octubre de 2026  
**Versión:** 1.0 Production Ready
