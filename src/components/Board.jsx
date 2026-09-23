import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import Lane from './Lane.jsx'

function Board({ quienSoy, onCambiarPersona }) {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true

    const cargarTareas = async () => {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('persona_id', quienSoy.id)
        .order('created_at', { ascending: true })
      if (activo && !error) setTareas(data ?? [])
      if (activo) setCargando(false)
    }

    cargarTareas()

    const canal = supabase
      .channel(`tareas-realtime-${quienSoy.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tareas',
          filter: `persona_id=eq.${quienSoy.id}`,
        },
        (payload) => {
          setTareas((actuales) => {
            if (payload.eventType === 'INSERT') {
              if (actuales.some((t) => t.id === payload.new.id)) return actuales
              return [...actuales, payload.new]
            }
            if (payload.eventType === 'UPDATE') {
              return actuales.map((t) => (t.id === payload.new.id ? payload.new : t))
            }
            if (payload.eventType === 'DELETE') {
              return actuales.filter((t) => t.id !== payload.old.id)
            }
            return actuales
          })
        },
      )
      .subscribe()

    return () => {
      activo = false
      supabase.removeChannel(canal)
    }
  }, [quienSoy.id])

  const moverTarea = async (tareaId, estado) => {
    setTareas((actuales) =>
      actuales.map((t) => (t.id === tareaId ? { ...t, estado } : t)),
    )
    await supabase
      .from('tareas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', tareaId)
  }

  const crearTarea = async (personaId, titulo, descripcion) => {
    const { data, error } = await supabase
      .from('tareas')
      .insert({
        persona_id: personaId,
        titulo,
        descripcion: descripcion || null,
      })
      .select()
      .single()
    if (!error && data) {
      setTareas((actuales) =>
        actuales.some((t) => t.id === data.id) ? actuales : [...actuales, data],
      )
    }
  }

  const toggleHecho = async (tarea) => {
    const nuevoEstado = tarea.estado === 'hecho' ? 'por_hacer' : 'hecho'
    await moverTarea(tarea.id, nuevoEstado)
  }

  const eliminarTarea = async (tarea) => {
    setTareas((actuales) => actuales.filter((t) => t.id !== tarea.id))
    await supabase.from('tareas').delete().eq('id', tarea.id)
  }

  return (
    <div>
      <header className="app-header">
        <h1>Tablero del Equipo</h1>
        <div className="whoami">
          <span>Hola, {quienSoy.nombre}</span>
          <button type="button" className="link-button" onClick={onCambiarPersona}>
            Cambiar de persona
          </button>
        </div>
      </header>
      {cargando ? (
        <p className="board-status">Cargando tareas...</p>
      ) : (
        <div className="board">
          <Lane
            persona={quienSoy}
            tareas={tareas}
            onMoverTarea={moverTarea}
            onCrearTarea={crearTarea}
            onToggleHecho={toggleHecho}
            onEliminarTarea={eliminarTarea}
          />
        </div>
      )}
    </div>
  )
}

export default Board
