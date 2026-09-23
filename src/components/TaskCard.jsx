function TaskCard({ tarea, onDragStart, onToggleHecho, onDelete }) {
  const esHecho = tarea.estado === 'hecho'

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(event) => onDragStart(event, tarea)}
    >
      <div className="task-card-top">
        <input
          type="checkbox"
          className="task-card-check"
          checked={esHecho}
          onChange={() => onToggleHecho(tarea)}
          title="Marcar como hecho"
        />
        <div className="task-card-body">
          <div className={`task-card-title${esHecho ? ' done' : ''}`}>
            {tarea.titulo}
          </div>
          {tarea.descripcion && (
            <div className="task-card-desc">{tarea.descripcion}</div>
          )}
        </div>
        <button
          type="button"
          className="task-card-delete"
          onClick={() => onDelete(tarea)}
          title="Borrar tarea"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default TaskCard
