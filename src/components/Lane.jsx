import { useState } from 'react'
import TaskCard from './TaskCard.jsx'

const COLUMNAS = [
  {
    estado: 'por_hacer',
    titulo: 'Por hacer',
    icono: '○',
    emptyIcon: '📋',
    emptyTitle: 'Aún no hay tareas',
    emptyText: 'Crea tu primera tarea para empezar a organizar tu trabajo.',
  },
  {
    estado: 'en_progreso',
    titulo: 'En progreso',
    icono: '◐',
    emptyIcon: '🔄',
    emptyTitle: 'Nada en progreso todavía',
    emptyText: 'Las tareas que estés trabajando aparecerán aquí.',
  },
  {
    estado: 'hecho',
    titulo: 'Hecho',
    icono: '✓',
    emptyIcon: '🎉',
    emptyTitle: '¡Todo en orden!',
    emptyText: 'Aquí verás tus tareas completadas.',
  },
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

function Lane({
  persona,
  tareas,
  mostrarForm,
  onAbrirForm,
  onCerrarForm,
  onMoverTarea,
  onCrearTarea,
  onToggleHecho,
  onEliminarTarea,
}) {
  const [columnaSobreVuelo, setColumnaSobreVuelo] = useState(null)

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
    onCerrarForm()
  }

  return (
    <div className="lane" style={{ '--lane-color': persona.color }}>
      <div className="lane-columns">
        {COLUMNAS.map((columna) => {
          const tareasColumna = tareas.filter((t) => t.estado === columna.estado)
          return (
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
              {tareasColumna.length === 0 && (
                <div className="column-empty">
                  <span className="column-empty-icon">{columna.emptyIcon}</span>
                  <div className="column-empty-title">{columna.emptyTitle}</div>
                  <p className="column-empty-text">{columna.emptyText}</p>
                </div>
              )}
              {tareasColumna.map((tarea) => (
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
                    <AddTaskForm onCancel={onCerrarForm} onCreate={handleCrearTarea} />
                  ) : (
                    <button type="button" className="add-task-trigger" onClick={onAbrirForm}>
                      + Nueva tarea
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Lane
