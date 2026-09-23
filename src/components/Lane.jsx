import { useState } from 'react'
import TaskCard from './TaskCard.jsx'

const COLUMNAS = [
  { estado: 'por_hacer', titulo: 'Por hacer', icono: '○' },
  { estado: 'en_progreso', titulo: 'En progreso', icono: '◐' },
  { estado: 'hecho', titulo: 'Hecho', icono: '✓' },
]

function AddTaskForm({ onCancel, onCreate }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!titulo.trim()) return
    setGuardando(true)
    await onCreate(titulo.trim(), descripcion.trim())
    setGuardando(false)
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
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
      <div className="add-task-form-actions">
        <button type="button" className="add-task-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="submit"
          className="add-task-save"
          disabled={!titulo.trim() || guardando}
        >
          Guardar
        </button>
      </div>
    </form>
  )
}

function Lane({ persona, tareas, onMoverTarea, onCrearTarea, onToggleHecho, onEliminarTarea }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [columnaSobreVuelo, setColumnaSobreVuelo] = useState(null)

  const total = tareas.length
  const hechas = tareas.filter((t) => t.estado === 'hecho').length
  const porcentaje = total === 0 ? 0 : Math.round((hechas / total) * 100)

  const handleDragStart = (event, tarea) => {
    event.dataTransfer.setData('text/plain', tarea.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (event, estado) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (columnaSobreVuelo !== estado) setColumnaSobreVuelo(estado)
  }

  const handleDrop = (event, estado) => {
    event.preventDefault()
    const tareaId = event.dataTransfer.getData('text/plain')
    setColumnaSobreVuelo(null)
    if (tareaId) onMoverTarea(tareaId, estado)
  }

  const handleCrearTarea = async (titulo, descripcion) => {
    await onCrearTarea(persona.id, titulo, descripcion)
    setMostrarForm(false)
  }

  return (
    <div className="lane" style={{ '--lane-color': persona.color }}>
      <div className="lane-header">
        <div className="lane-header-title">
          <span className="lane-avatar" style={{ background: persona.color }}>
            {persona.nombre.charAt(0).toUpperCase()}
          </span>
          <h2>{persona.nombre}</h2>
          <span className="lane-progress-text">
            {hechas}/{total} tareas hechas
          </span>
        </div>
        <div className="lane-progress-bar">
          <div className="lane-progress-fill" style={{ width: `${porcentaje}%` }} />
        </div>
      </div>
      <div className="lane-columns">
        {COLUMNAS.map((columna) => (
          <div
            key={columna.estado}
            className={`column${columnaSobreVuelo === columna.estado ? ' drag-over' : ''}`}
            onDragOver={(event) => handleDragOver(event, columna.estado)}
            onDragLeave={() => setColumnaSobreVuelo(null)}
            onDrop={(event) => handleDrop(event, columna.estado)}
          >
            <div className={`column-title column-title-${columna.estado}`}>
              <span className="column-title-icon">{columna.icono}</span>
              <span>{columna.titulo}</span>
            </div>
            {tareas
              .filter((t) => t.estado === columna.estado)
              .map((tarea) => (
                <TaskCard
                  key={tarea.id}
                  tarea={tarea}
                  onDragStart={handleDragStart}
                  onToggleHecho={onToggleHecho}
                  onDelete={onEliminarTarea}
                />
              ))}
            {columna.estado === 'por_hacer' && (
              <div className="add-task">
                {mostrarForm ? (
                  <AddTaskForm
                    onCancel={() => setMostrarForm(false)}
                    onCreate={handleCrearTarea}
                  />
                ) : (
                  <button
                    type="button"
                    className="add-task-trigger"
                    onClick={() => setMostrarForm(true)}
                  >
                    + Nueva tarea
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Lane
