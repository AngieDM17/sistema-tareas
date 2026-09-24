import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import TeamManager from './TeamManager.jsx'

const ESTADOS = [
  { valor: 'por_hacer', etiqueta: 'Por hacer' },
  { valor: 'en_progreso', etiqueta: 'En progreso' },
  { valor: 'hecho', etiqueta: 'Hecho' },
]

function NuevaTareaForm({ personas, onCancel, onCrear }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [personaId, setPersonaId] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!titulo.trim() || !personaId) return
    setGuardando(true)
    await onCrear(personaId, titulo.trim(), descripcion.trim())
    setGuardando(false)
  }

  return (
    <form className="add-task-form overview-new-task" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Titulo de la tarea"
        value={titulo}
        onChange={(event) => setTitulo(event.target.value)}
        autoFocus
      />
      <textarea
        placeholder="Descripcion (opcional)"
        rows={2}
        value={descripcion}
        onChange={(event) => setDescripcion(event.target.value)}
      />
      <select value={personaId} onChange={(event) => setPersonaId(event.target.value)}>
        <option value="">Asignar a...</option>
        {personas.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.nombre}
          </option>
        ))}
      </select>
      <div className="add-task-form-actions">
        <button type="button" className="add-task-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="submit"
          className="add-task-save"
          disabled={!titulo.trim() || !personaId || guardando}
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

function Overview({ personas, onPersonasChange, onVolver }) {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroPersona, setFiltroPersona] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [seccion, setSeccion] = useState('tareas')

  useEffect(() => {
    let activo = true

    const cargarTareas = async () => {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('created_at', { ascending: true })
      if (activo && !error) setTareas(data ?? [])
      if (activo) setCargando(false)
    }

    cargarTareas()

    const canal = supabase
      .channel('tareas-realtime-todas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tareas' },
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
  }, [])

  const personaPorId = useMemo(() => {
    const mapa = new Map()
    personas.forEach((persona) => mapa.set(persona.id, persona))
    return mapa
  }, [personas])

  const crearTarea = async (personaId, titulo, descripcion) => {
    const { data, error } = await supabase
      .from('tareas')
      .insert({ persona_id: personaId, titulo, descripcion: descripcion || null })
      .select()
      .single()
    if (!error && data) {
      setTareas((actuales) =>
        actuales.some((t) => t.id === data.id) ? actuales : [...actuales, data],
      )
      setMostrarForm(false)
    }
  }

  const cambiarEstado = async (tareaId, estado) => {
    setTareas((actuales) => actuales.map((t) => (t.id === tareaId ? { ...t, estado } : t)))
    await supabase
      .from('tareas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', tareaId)
  }

  const eliminarTarea = async (tarea) => {
    setTareas((actuales) => actuales.filter((t) => t.id !== tarea.id))
    await supabase.from('tareas').delete().eq('id', tarea.id)
  }

  const pendientes = tareas.filter((t) => t.estado === 'por_hacer').length
  const enProgreso = tareas.filter((t) => t.estado === 'en_progreso').length
  const completadas = tareas.filter((t) => t.estado === 'hecho').length

  const tareasFiltradas = tareas.filter((tarea) => {
    if (filtroPersona !== 'todas' && tarea.persona_id !== filtroPersona) return false
    if (filtroEstado !== 'todos' && tarea.estado !== filtroEstado) return false
    return true
  })

  return (
    <div className="page-shell">
      <div className="bg-blob bg-blob-a" />
      <div className="bg-blob bg-blob-b" />
      <div className="board-card">
        <div className="bg-dots" />
        <header className="app-header">
          <div className="brand-badge">
            <span className="brand-badge-icon">📋</span>
            <h1 className="brand-badge-title">Todas las tareas</h1>
          </div>
          <div className="whoami">
            <button type="button" className="link-button" onClick={onVolver}>
              Volver a mi tablero
            </button>
          </div>
        </header>

        {cargando ? (
          <p className="board-status">Cargando tareas...</p>
        ) : (
          <>
            <div className="board-summary">
              <div className="board-summary-stats">
                <div className="stat-group">
                  <span className="stat-icon stat-icon-todo">📝</span>
                  <div>
                    <div className="stat-number">{pendientes}</div>
                    <div className="stat-label">Pendientes</div>
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
                <button type="button" className="primary-button" onClick={() => setMostrarForm(true)}>
                  + Nueva tarea
                </button>
              </div>
            </div>

            <div className="overview-tabs">
              <button
                type="button"
                className={`overview-tab${seccion === 'tareas' ? ' active' : ''}`}
                onClick={() => setSeccion('tareas')}
              >
                Tareas
              </button>
              <button
                type="button"
                className={`overview-tab${seccion === 'equipo' ? ' active' : ''}`}
                onClick={() => setSeccion('equipo')}
              >
                Equipo
              </button>
            </div>

            {seccion === 'tareas' ? (
              <>
                {mostrarForm && (
                  <NuevaTareaForm
                    personas={personas}
                    onCancel={() => setMostrarForm(false)}
                    onCrear={crearTarea}
                  />
                )}

                <div className="overview-filters">
                  <select value={filtroPersona} onChange={(event) => setFiltroPersona(event.target.value)}>
                    <option value="todas">Todas las personas</option>
                    {personas.map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.nombre}
                      </option>
                    ))}
                  </select>
                  <select value={filtroEstado} onChange={(event) => setFiltroEstado(event.target.value)}>
                    <option value="todos">Todos los estados</option>
                    {ESTADOS.map((estado) => (
                      <option key={estado.valor} value={estado.valor}>
                        {estado.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overview-list">
                  <div className="overview-row overview-row-head">
                    <span>Tarea</span>
                    <span>Asignado a</span>
                    <span>Estado</span>
                    <span>Acciones</span>
                  </div>
                  {tareasFiltradas.length === 0 && (
                    <p className="board-status">No hay tareas para este filtro.</p>
                  )}
                  {tareasFiltradas.map((tarea) => {
                    const persona = personaPorId.get(tarea.persona_id)
                    return (
                      <div className="overview-row" key={tarea.id}>
                        <div className="overview-task">
                          <div className="overview-task-title">{tarea.titulo}</div>
                          {tarea.descripcion && (
                            <div className="overview-task-desc">{tarea.descripcion}</div>
                          )}
                        </div>
                        <div className="overview-assignee">
                          {persona ? (
                            <>
                              <span className="overview-avatar" style={{ background: persona.color }}>
                                {persona.nombre.charAt(0).toUpperCase()}
                              </span>
                              <span>{persona.nombre}</span>
                            </>
                          ) : (
                            <span className="overview-unassigned">Sin asignar</span>
                          )}
                        </div>
                        <select
                          value={tarea.estado}
                          onChange={(event) => cambiarEstado(tarea.id, event.target.value)}
                        >
                          {ESTADOS.map((estado) => (
                            <option key={estado.valor} value={estado.valor}>
                              {estado.etiqueta}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="link-button overview-delete"
                          onClick={() => eliminarTarea(tarea)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <TeamManager personas={personas} onPersonasChange={onPersonasChange} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Overview
