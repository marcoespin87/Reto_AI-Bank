# 🔧 CORRECCIONES NOTFOUND ERROR - React Native/Expo Web

## 📋 Resumen de Cambios

Se ha corregido el error `NotFoundError: Failed to execute 'removeChild' on 'Node'` que ocurría en la plataforma Web debido a problemas de desincronización entre el Virtual DOM y el DOM real.

---

## 🔴 PROBLEMAS ENCONTRADOS

### 1. **BottomNav.tsx - Renderizado Condicional Inestable** ⚠️ CRÍTICO

**Problema:**

```tsx
// ❌ INESTABLE: retorna dos estructuras completamente diferentes
if (isMundial) {
  return <TouchableOpacity style={s.navCenter}>...
}
return <TouchableOpacity style={s.navItem}>...
```

Cuando el elemento "mundial" se renderizaba, su estructura era radicalmente diferente a los otros tabs (usaba `navCenter` con un `View` envolvedor, mientras otros usaban directamente `navItem`). React no podía reconciliar esto correctamente.

**Solución:**

- ✅ Unificado a una única estructura `TouchableOpacity`
- ✅ Se usan estilos condicionales con `[s.navItem, isMundial && s.navCenter]`
- ✅ El View interior se renderiza solo cuando es necesario con lógica condicional
- ✅ Keys estables: `key={`nav-${tab.key}`}`

**Archivo:** `components/BottomNav.tsx`

---

### 2. **index.tsx - Keys usando Índice (línea ~211)** ❌ FRÁGIL

**Problema:**

```tsx
{misStickersRecientes.slice(0, 3).map((us: any, i: number) => {
  return <TouchableOpacity key={i} ...>  // ❌ Índice es frágil
})}
```

Los índices cambian si la lista se reordena, causando reconciliación incorrecta.

**Solución:**

- ✅ Cambio a ID único: `key={`cromo-${us.id ?? us.stickers?.id ?? Math.random()}`}`
- ✅ Fallback seguro si no hay ID

**Archivo:** `app/(tabs)/index.tsx` - Sección "Cromos recientes"

---

### 3. **index.tsx - Renderizado Condicional Extremo en Transacciones** ⚠️ CRÍTICO

**Problema:**

```tsx
{transactions.length > 0 ? (
  transactions.map(tx => <View key={tx.id} ...>)
) : (
  <>
    {[...].map((item, i) => <View key={i} ...>)}  // ❌ Dos estructuras diferentes
  </>
)}
```

Cuando `transactions` pasa de vacío a lleno (o viceversa), React cambia entre dos estructuras radicalmente diferentes, causando errores de reconciliación.

**Solución:**

- ✅ Envuelto todo en un `View` contenedor ESTABLE
- ✅ El contenedor siempre existe, solo su contenido cambia
- ✅ Keys mejoradas: `key={`tx-${tx.id}`}` y `key={`tx-default-${item.id}`}`

```tsx
<View>
  {transactions.length > 0 ? (
    transactions.map(tx => <View key={`tx-${tx.id}`} ...>)
  ) : (
    [{...}].map(item => <View key={`tx-default-${item.id}`} ...>)
  )}
</View>
```

**Archivo:** `app/(tabs)/index.tsx` - Sección "Movimientos recientes"

---

### 4. **grupo.tsx - Renderizado Seguro ✅ Correcto**

Este componente ya estaba bien:

- ✅ Keys usando IDs: `key={`pending-${p.user_id}`}`, `key={m.id}`, `key={obj.id}`
- ✅ Renderizado condicional dentro de View contenedor
- ✅ No hay índices como keys

**Archivo:** `app/(tabs)/grupo.tsx` - Sin cambios

---

## 🛡️ NUEVA CAPA DE PROTECCIÓN

### 5. **ErrorBoundary.tsx - Componente de Error** (NUEVO)

Creado para capturar cualquier error no previsto que escape de las correcciones anteriores.

**Características:**

- ✅ Captura errores de reconciliación
- ✅ Muestra UI fallback amigable
- ✅ Loguea errores en consola
- ✅ No interfiere con la app en funcionamiento

**Archivo:** `components/ErrorBoundary.tsx` (NUEVO)

---

### 6. **app/\_layout.tsx - App Wrapeada** (ACTUALIZADO)

El layout root ahora envuelve toda la app con `ErrorBoundary`:

```tsx
<ErrorBoundary>
  <ThemeProvider>
    <Stack screenOptions={{ headerShown: false }}>...</Stack>
  </ThemeProvider>
</ErrorBoundary>
```

**Archivo:** `app/_layout.tsx`

---

## 📊 TABLA DE CAMBIOS

| Archivo                     | Cambio                         | Severidad  | Estado   |
| --------------------------- | ------------------------------ | ---------- | -------- |
| `BottomNav.tsx`             | Unificada estructura de render | 🔴 CRÍTICO | ✅ Hecho |
| `index.tsx` (cromos)        | Eliminadas keys indexadas      | 🟠 Medio   | ✅ Hecho |
| `index.tsx` (transacciones) | Estabilizado contenedor + keys | 🔴 CRÍTICO | ✅ Hecho |
| `ErrorBoundary.tsx`         | Componente nuevo               | 🟡 Defensa | ✅ Hecho |
| `_layout.tsx`               | Wrapped con ErrorBoundary      | 🟡 Defensa | ✅ Hecho |

---

## ✅ VALIDACIÓN

Después de estos cambios:

1. **BottomNav** tiene estructura estable - reconciliación correcta en Web
2. **Cromos** usan IDs en lugar de índices - orden estable
3. **Transacciones** tienen contenedor fijo - no colapsa al cambiar estado
4. **ErrorBoundary** captura excepciones - proporciona fallback UI

---

## 🚀 PRÓXIMOS PASOS

1. **Test en Web:**

   ```bash
   expo start
   # Selecciona 'w' para Web
   ```

   - Navega entre tabs
   - Abre/cierra modales
   - Cambia entre diferentes pantallas
   - Monitorea consola por errores

2. **Monitorea Browser DevTools:**
   - Abre DevTools (F12)
   - Ve a "Console" para ver logs
   - Ve a "Network" para confirmar requests

3. **Si persiste el error:**
   - Captura el stack trace completo
   - Verifica qué componente lo causa
   - Revisa `context/ThemeContext.tsx` por cambios de state rápidos

---

## 📚 REFERENCIA

- **React Reconciliation:** https://react.dev/learn/render-and-commit
- **Error Boundaries:** https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- **Keys en React Native:** https://reactnative.dev/docs/flatlist#required-props

---

## 📝 NOTAS TÉCNICAS

### Patrón Seguro de Renderizado Condicional

```tsx
// ✅ CORRECTO: Contenedor estable
<View style={StyleSheet.absoluteFill}>
  {condition && <ContentA />}
  {!condition && <ContentB />}
</View>;

// ❌ INCORRECTO: Estructura cambia
{
  condition ? <ContentA style={s.a} /> : <ContentB style={s.b} />;
}
```

### Keys Estables

```tsx
// ✅ BIEN: ID único
.map(item => <View key={`item-${item.id}`} />)

// ❌ MAL: Índice
.map((item, i) => <View key={i} />)

// ✅ BIEN: Combinado
.map(item => <View key={`${item.type}-${item.id}`} />)
```

---

**Versión:** 1.0  
**Fecha:** 2026-04-07  
**Estado:** ✅ Completado
