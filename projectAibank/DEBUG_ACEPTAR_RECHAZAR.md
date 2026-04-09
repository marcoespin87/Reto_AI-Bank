# DEBUG: Sistema de Aprobación de Miembros en Grupos

## 🔴 PROBLEMA

El usuario **NO puede aceptar solicitudes de miembros** en la pestaña de "Grupos", pero **SÍ puede rechazar**.

## 📊 TABLAS INVOLUCRADAS

### 1. `group_join_votes` - Votos para aprobación

```sql
CREATE TABLE public.group_join_votes (
  id integer PRIMARY KEY,
  group_id integer NOT NULL,        -- FK a groups.id
  candidato_id integer NOT NULL,    -- FK a users.id (usuario a aprobar)
  votante_id integer NOT NULL,      -- FK a users.id (usuario que vota)
  voto USER-DEFINED NOT NULL,       -- ENUM: ??? (se usa "aprobado")
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT group_join_votes_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT group_join_votes_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.users(id),
  CONSTRAINT group_join_votes_votante_id_fkey FOREIGN KEY (votante_id) REFERENCES public.users(id)
);
```

### 2. `group_members` - Miembros del grupo

```sql
CREATE TABLE public.group_members (
  id integer PRIMARY KEY,
  group_id integer NOT NULL,        -- FK a groups.id
  user_id integer NOT NULL,         -- FK a users.id
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::miembro_estado,
  -- ENUM: puede ser 'pendiente', 'activo', etc.
  fecha_ingreso date,
  mailes_aportados integer NOT NULL DEFAULT 0,
  medalla_actual integer NOT NULL DEFAULT 0,
  estrellas_actuales integer NOT NULL DEFAULT 0,
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
```

### 3. `groups` - Grupos

```sql
CREATE TABLE public.groups (
  id integer PRIMARY KEY,
  nombre character varying NOT NULL,
  temporada_id integer NOT NULL,
  creador_id integer NOT NULL,      -- FK a users.id
  liga_id integer NOT NULL,
  tipo_formacion USER-DEFINED NOT NULL DEFAULT 'libre'::grupo_tipo_formacion,
  max_miembros integer NOT NULL DEFAULT 10,
  codigo_invitacion character varying UNIQUE,
  nombre_grupo character varying
);
```

---

## 💻 CÓDIGO ACTUAL - `aprobarMiembro()` (LINEA 342)

```typescript
async function aprobarMiembro(candidatoId: number) {
  if (!grupo || !userId) return;

  try {
    setLoading(true);

    // Verificar si ya votaste
    const { data: votosExistentes, error: checkError } = await supabase
      .from("group_join_votes")
      .select("id")
      .eq("group_id", grupo.id)
      .eq("candidato_id", candidatoId)
      .eq("votante_id", userId);

    if (checkError) {
      Alert.alert(
        "Error",
        "No pudimos verificar tu voto: " + checkError.message,
      );
      setLoading(false);
      return;
    }

    if (votosExistentes && votosExistentes.length > 0) {
      Alert.alert("Aviso", "Ya votaste por este candidato");
      setLoading(false);
      return;
    }

    // Insertar voto
    const { error: insertError } = await supabase
      .from("group_join_votes")
      .insert({
        group_id: grupo.id,
        candidato_id: candidatoId,
        votante_id: userId,
        voto: "aprobado", // ⚠️ VERIFICAR: ¿Es el valor correcto del ENUM?
        fecha: new Date().toISOString().split("T")[0],
      });

    if (insertError) {
      Alert.alert("Error al votar", insertError.message);
      setLoading(false);
      return;
    }

    // Contar votos aprobados DESPUÉS del insert
    const { count: votosAprobados, error: countError } = await supabase
      .from("group_join_votes")
      .select("id", { count: "exact", head: true })
      .eq("group_id", grupo.id)
      .eq("candidato_id", candidatoId)
      .eq("voto", "aprobado"); // ⚠️ VERIFICAR: ¿Coincide con el ENUM?

    if (countError) {
      Alert.alert(
        "Error",
        "No pudimos contar los votos: " + countError.message,
      );
      setLoading(false);
      return;
    }

    const totalMiembros = miembros.length;
    const votosNecesarios = totalMiembros;
    const votosActuales = votosAprobados || 0;

    // Si se alcanzaron los votos necesarios, activar miembro
    if (votosActuales >= votosNecesarios) {
      const { error: updateError } = await supabase
        .from("group_members")
        .update({
          estado: "activo",
          fecha_ingreso: new Date().toISOString().split("T")[0],
        })
        .eq("group_id", grupo.id)
        .eq("user_id", candidatoId);

      if (updateError) {
        Alert.alert(
          "Error",
          "Error al activar al miembro: " + updateError.message,
        );
        setLoading(false);
        return;
      }

      Alert.alert(
        "¡Aprobado! 🎉",
        `Todos los ${totalMiembros} miembros aprobaron. El nuevo integrante ya es parte del grupo.`,
      );
    } else {
      Alert.alert(
        "Voto registrado ✓",
        `${votosActuales} de ${votosNecesarios} votos.\nFaltan ${votosNecesarios - votosActuales} votos más.`,
      );
    }

    setLoading(false);
    loadData();
  } catch (err) {
    console.error("Error en aprobarMiembro:", err);
    Alert.alert("Error inesperado", String(err));
    setLoading(false);
  }
}
```

---

## 💻 CÓDIGO ACTUAL - `rechazarMiembro()` (LINEA 449)

```typescript
async function rechazarMiembro(candidatoId: number) {
  if (!grupo) return;

  try {
    setLoading(true);

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", grupo.id)
      .eq("user_id", candidatoId)
      .eq("estado", "pendiente");

    if (error) {
      Alert.alert("Error al rechazar", error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    loadData();
    Alert.alert("Rechazado ❌", "La solicitud fue rechazada.");
  } catch (err) {
    console.error("Error en rechazarMiembro:", err);
    Alert.alert("Error inesperado", String(err));
    setLoading(false);
  }
}
```

---

## 🔍 INFORMACIÓN DEL SCHEMA - ENUMS DESCONOCIDOS

El schema in `db` file define:

- `voto` como `USER-DEFINED` (tipo ENUM pero la definición no está incluida)
- `estado` como `USER-DEFINED DEFAULT 'pendiente'::miembro_estado` (tipo ENUM con valor por defecto "pendiente")

**PROBLEMA CRÍTICO:** No sabemos exactamente qué valores acepta el ENUM `voto` en `group_join_votes`.

### Posibles valores del ENUM `voto`:

- ❓ `"aprobado"` (usado actualmente en el código)
- ❓ `"aprobada"` (femenino)
- ❓ `"approved"` (inglés)
- ❓ `"si"` (opción)
- ❓ `"no"` (opción)
- ❓ Otros valores desconocidos

**Para verificar el ENUM exacto, ejecutar en Supabase SQL:**

```sql
SELECT enum_range(NULL::voto);
-- o
SELECT e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid WHERE t.typname = 'voto';
```

---

## ✅ ACCIONES RECOMENDADAS PARA CLAUDE

1. **URGENTE:** Verificar exactamente qué valores acepta el ENUM `voto` en `group_join_votes`
   - Si el enum espera `"aprobada"` en lugar de `"aprobado"`, el insert falla silenciosamente
2. Revisar si el INSERT en `group_join_votes` está funcionando
   - El `insertError` debería capturar esto, pero verificar en logs de Supabase

3. Comprobar las políticas RLS (Row Level Security) de Supabase
   - Podrían bloquear el INSERT silenciosamente

4. Verificar si `miembros.length` está contando correctamente
   - La lógica de "todos deben votar" depende de este valor

5. Simplificar la lógica si es necesario
   - Considerar alternativas a votación unánime

---

## 📊 COMPARATIVA: POR QUÉ RECHAZAR FUNCIONA Y APROBAR NO

| Operación          | rechazarMiembro ✅        | aprobarMiembro ❌                            |
| ------------------ | ------------------------- | -------------------------------------------- |
| **Tabla objetivo** | `group_members`           | `group_join_votes`                           |
| **Operación SQL**  | DELETE                    | INSERT                                       |
| **Complejidad**    | Simple: 1 operación       | Compleja: 3-4 operaciones                    |
| **Campos usados**  | group_id, user_id, estado | group_id, candidato_id, votante_id, **voto** |
| **Punto de fallo** | Nunca - el row existe     | **ENUM voto invalido**                       |
| **Resultado**      | Delete siempre funciona   | Insert falla si ENUM es incorrecto           |

### Análisis detallado:

**rechazarMiembro (funciona):**

1. DELETE simple: Elimina el row de group_members donde estado='pendiente'
2. No introduce nuevos datos, solo borra
3. No depende de tipos ENUM complicados

**aprobarMiembro (no funciona):**

1. INSERT con campo `voto` = ??? (tipo ENUM desconocido)
2. Si el ENUM tiene valor diferente a "aprobado", falla
3. El insertError captura, pero el usuario solo ve "error al votar"
4. El voto nunca se registra
5. El contador de votos luego no encuentra nada
6. El miembro nunca se activa

---

## 🔧 SOLUCIÓN INMEDIATA (temporal)

Mientras se verifica el ENUM, prueba esto:

```typescript
// Cambiar esto:
voto: "aprobado",

// Por esto (probar cada opción):
voto: "aprobada",      // Si ENUM es femenino
voto: "approved",      // Si ENUM es en inglés
voto: "si",            // Si ENUM es booleano-like
```

---

## 📋 INFORMACIÓN CLAVE

- **Usuario actual**: `userId` (que está votando)
- **Usuario a aprobar**: `candidatoId` (candidato)
- **Grupo**: `grupo.id`
- **Miembros activos**: `miembros.length`
- **Tabla de votos**: `group_join_votes`
- **Tabla de miembros**: `group_members`
- **Archivo origen**: `app/(tabs)/grupo.tsx` (lineas 342-476)
