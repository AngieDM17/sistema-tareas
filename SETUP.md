# Como poner en marcha el Tablero del Equipo

Ya esta todo el codigo listo. Solo faltan 3 pasos sencillos.

## 1. Crear las tablas en Supabase

1. Entra a tu proyecto en https://supabase.com
2. En el menu de la izquierda, entra a **SQL Editor**.
3. Abre el archivo `supabase/schema.sql` (esta dentro de esta misma carpeta), copia todo su contenido y pegalo en el SQL Editor.
4. Dale click a **Run** (o "Ejecutar"). Esto crea las dos tablas (`personas` y `tareas`) y ya deja cargados los nombres de Angie, Niray y Julieth con un color para cada una.

Este paso se hace **una sola vez**.

## 2. Instalar las dependencias del proyecto

Si es la primera vez que abres este proyecto en tu computadora, abre una terminal en esta carpeta y escribe:

```
npm install
```

Esto descarga todo lo necesario para que la aplicacion funcione. Tarda un par de minutos.

## 3. Iniciar la aplicacion

Con la terminal abierta en esta carpeta, escribe:

```
npm run dev
```

Va a mostrar una direccion tipo `http://localhost:5173`. Abrela en tu navegador y ahi vas a ver el selector de nombre y despues el tablero.

Para detenerla, vuelve a la terminal y presiona `Ctrl + C`.

---

**Nota:** publicar la aplicacion en internet (Vercel) para que todo el equipo la use desde su propia computadora sin depender de que alguien la tenga corriendo localmente, es el siguiente paso y lo hacemos juntos mas adelante.
