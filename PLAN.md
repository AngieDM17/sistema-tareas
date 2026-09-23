# Sistema de Tareas del Equipo

Tablero donde cada compañera entra a su propia mesa de trabajo y ve únicamente sus propias tareas. Para ver el avance de otra persona hay que cambiar de perfil (opción "Cambiar de persona").

## Stack

- **Frontend:** React + Vite
- **Backend/DB:** Supabase (Postgres + Realtime)
- **Hosting:** Vercel
- **Costo:** $0 (planes gratuitos de ambos)

## Modelo de datos (Supabase)

**personas**
| campo | tipo |
|---|---|
| id | uuid |
| nombre | text |
| color | text (para identificar su carril) |

**tareas**
| campo | tipo |
|---|---|
| id | uuid |
| titulo | text |
| descripcion | text (opcional) |
| persona_id | uuid (FK -> personas) |
| estado | enum: `por_hacer` / `en_progreso` / `hecho` |
| created_at | timestamp |
| updated_at | timestamp |

## Pantallas

1. **Selector de persona** — al entrar, elegís tu nombre de una lista (sin contraseña).
2. **Tablero principal** — muestra solo el carril de la persona logueada, con 3 columnas (Por hacer / En progreso / Hecho). Drag & drop entre columnas.
3. **Barra de avance** — contador tipo "5/8 tareas hechas" con barra de progreso, de la persona logueada.

## Fases

1. **Setup**: proyecto React + Vite, cuenta Supabase, tablas creadas, conexión probada.
2. **CRUD de tareas**: crear, editar, borrar tareas asignadas a una persona.
3. **Tablero Kanban**: carriles por persona, drag & drop entre columnas, sincronización en tiempo real (Supabase Realtime) para que los cambios de una se vean al instante en la pantalla de las demás.
4. **Avance por persona**: contador y barra de progreso por carril.
5. **Deploy**: publicar en Vercel, compartir el link con el equipo.

## Equipo

- Angie
- Niray
- Julieth

## Pendiente a decidir más adelante

- Colores por compañera (se asignan al cargar los datos iniciales en `personas`).
- Nombres de las columnas si quieren otros que no sean Por hacer / En progreso / Hecho.
