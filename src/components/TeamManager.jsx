import { useState } from 'react'
import { supabase } from '../supabaseClient.js'

const PALETA_COLORES = [
  '#6366f1',
  '#22c55e',
  '#f97316',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#8b5cf6',
  '#ef4444',
]

function TeamManager({ personas, onPersonasChange }) {
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [eliminandoId, setEliminandoId] = useState(null)

  const siguienteColor = PALETA_COLORES[personas.length % PALETA_COLORES.length]

  const agregarPersona = async (event) => {
    event.preventDefault()
    if (!nombre.trim()) return
    setGuardando(true)
    setError('')
    const { error: insertError } = await supabase
      .from('personas')
      .insert({ nombre: nombre.trim(), color: siguienteColor })
    if (insertError) {
      setError('No se pudo agregar la persona. Intenta de nuevo.')
    } else {
      setNombre('')
      await onPersonasChange()
    }
    setGuardando(false)
  }

  const eliminarPersona = async (persona) => {
    setError('')
    setEliminandoId(persona.id)
    const { error: deleteError } = await supabase.from('personas').delete().eq('id', persona.id)
    if (deleteError) {
      if (deleteError.code === '23503') {
        setError(
          `No se puede eliminar a ${persona.nombre}: tiene tareas asignadas. Reasigná o eliminá sus tareas primero.`,
        )
      } else {
        setError(`No se pudo eliminar a ${persona.nombre}.`)
      }
    } else {
      await onPersonasChange()
    }
    setEliminandoId(null)
  }

  return (
    <div className="team-manager">
      {error && <p className="team-error">{error}</p>}

      <div className="team-list">
        {personas.map((persona) => (
          <div className="team-item" key={persona.id}>
            <span className="overview-avatar" style={{ background: persona.color }}>
              {persona.nombre.charAt(0).toUpperCase()}
            </span>
            <span className="team-item-name">{persona.nombre}</span>
            <button
              type="button"
              className="link-button team-item-remove"
              onClick={() => eliminarPersona(persona)}
              disabled={eliminandoId === persona.id}
            >
              Eliminar
            </button>
          </div>
        ))}
        {personas.length === 0 && <p className="board-status">Todavía no hay personas en el equipo.</p>}
      </div>

      <form className="team-form" onSubmit={agregarPersona}>
        <input
          type="text"
          placeholder="Nombre de la persona"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
        />
        <span className="team-form-preview" style={{ background: siguienteColor }}>
          {nombre.trim() ? nombre.trim().charAt(0).toUpperCase() : '?'}
        </span>
        <button type="submit" className="add-task-save" disabled={!nombre.trim() || guardando}>
          + Agregar persona
        </button>
      </form>
    </div>
  )
}

export default TeamManager
