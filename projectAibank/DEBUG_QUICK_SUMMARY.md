# 🎯 CONTEXTO RÁPIDO - Problema de Aprobación de Miembros

## Estado Actual

✅ **Rechazar miembro**: FUNCIONA  
❌ **Aceptar miembro**: NO FUNCIONA

## Problema Específico

El usuario hace clic en botón "Aceptar" → nada sucede o aparece error de Supabase

## Archivos Críticos

- **Lógica**: [app/(tabs)/grupo.tsx](<app/(tabs)/grupo.tsx#L342>) (lineas 342-476)
  - `aprobarMiembro()` línea 342 ❌ NO FUNCIONA
  - `rechazarMiembro()` línea 449 ✅ FUNCIONA
- **UI**: [components/GrupoView.tsx](components/GrupoView.tsx)

## SQL a Ejecutar en Supabase

```sql
-- Verificar qué valores acepta el ENUM 'voto'
SELECT e.enumlabel
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname = 'voto';

-- Resultado actual esperado (alguien sabe el valor exacto?)
-- Probable: voto=['aprobado'] o voto=['aprobada'] o voto=['approved']
```

## Diferencia Crítica

### Rechazar (DELETE) - ✅ FUNCIONA

```javascript
await supabase
  .from("group_members")
  .delete()
  .eq("group_id", grupo.id)
  .eq("user_id", candidatoId)
  .eq("estado", "pendiente"); // Solo deletea, sin ENUM complicado
```

### Aceptar (INSERT + COUNT + UPDATE) - ❌ NO FUNCIONA

```javascript
// Paso 1: INSERT con ENUM 'voto' - ⚠️ AQUÍ FALLA
await supabase.from("group_join_votes").insert({
  group_id: grupo.id,
  candidato_id: candidatoId,
  votante_id: userId,
  voto: "aprobado", // ⚠️ ¿ES EL VALOR CORRECTO? ¿O DEBERÍA SER 'aprobada'/'approved'?
  fecha: new Date().toISOString().split("T")[0],
});

// Paso 2: COUNT después del insert
// Paso 3: UPDATE estado a 'activo' si votación unánime
```

## Hipótesis Principal

El ENUM `voto` probablemente NO acepta `"aprobado"`. Valores probables:

- `"aprobada"` (femenino)
- `"approved"` (inglés)
- Otro valor completamente diferente

## Test Sugerido

```javascript
// En approvalMiembro, antes del insert:
console.log("Intentando insertar con voto='aprobado'");
const { error: insertError, data } = await supabase.from("group_join_votes").insert({...});
if (insertError) {
  console.log("ERROR INSERT:", insertError);  // Debería mostrar tipo ENUM invalido
}
```

## Archivo de Contexto Completo

Ver: `DEBUG_ACEPTAR_RECHAZAR.md` (incluye todo el código y tablas)
