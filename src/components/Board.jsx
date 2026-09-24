import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import Lane from './Lane.jsx'

function Board({ quienSoy, onCambiarPersona, onVerTodas }) {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)

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

  const pendientes = tareas.filter((t) => t.estado === 'por_hacer').length
  const enProgreso = tareas.filter((t) => t.estado === 'en_progreso').length
  const completadas = tareas.filter((t) => t.estado === 'hecho').length

  return (
    <div className="page-shell">
      <div className="bg-blob bg-blob-a" />
      <div className="bg-blob bg-blob-b" />
      <div className="board-card">
        <div className="bg-dots" />
        <header className="app-header">
          <div className="brand-badge">
            <span className="brand-badge-icon">📋</span>
            <h1 className="brand-badge-title">Tablero del equipo</h1>
          </div>
          <div className="whoami">
            <span>Hola, {quienSoy.nombre}</span>
            <span className="whoami-avatar" style={{ background: quienSoy.color }}>
              {quienSoy.nombre.charAt(0).toUpperCase()}
            </span>
            <button type="button" className="link-button" onClick={onVerTodas}>
              Ver todas las tareas
            </button>
            <button type="button" className="link-button" onClick={onCambiarPersona}>
              Cambiar de persona
            </button>
          </div>
        </header>

        {cargando ? (
          <p className="board-status">Cargando tareas...</p>
        ) : (
          <>
            <div className="board-summary">
              <div className="board-summary-person">
                <span className="board-summary-avatar" style={{ background: quienSoy.color }}>
                  {quienSoy.nombre.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="board-summary-name">{quienSoy.nombre}</div>
                  <p className="board-summary-sub">
                    Aquí puedes organizar y dar seguimiento a tus tareas.
                  </p>
                </div>
              </div>
              <div className="board-summary-stats">
                <div className="stat-group">
                  <span className="stat-icon stat-icon-todo">📝</span>
                  <div>
                    <div className="stat-number">{pendientes}</div>
                    <div className="stat-label">Mis tareas</div>
                  </div>
                </div>
                <div className="stat-group">
                  <span className="stat-icon stat-icon-progress">⏳</span>
                  <div>
                    <div className="stat-number">{enProgreso}</div>
                    <div className="stat-label">En progreso</div>
                  </div>
                </div>
                <div className="stat-group">
                  <span className="stat-icon stat-icon-done">✅</span>
                  <div>
                    <div className="stat-number">{completadas}</div>
                    <div className="stat-label">Completadas</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setMostrarForm(true)}
                >
                  + Nueva tarea
                </button>
              </div>
            </div>

            <div className="board">
              <Lane
                persona={quienSoy}
                tareas={tareas}
                mostrarForm={mostrarForm}
                onAbrirForm={() => setMostrarForm(true)}
                onCerrarForm={() => setMostrarForm(false)}
                onMoverTarea={moverTarea}
                onCrearTarea={crearTarea}
                onToggleHecho={toggleHecho}
                onEliminarTarea={eliminarTarea}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Board
