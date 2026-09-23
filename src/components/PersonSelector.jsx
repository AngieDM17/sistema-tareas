function PersonSelector({ personas, onSelect }) {
  return (
    <div className="person-selector">
      <h1>📋 Tablero del Equipo</h1>
      <p>Elegi tu nombre para ver y actualizar tus tareas</p>
      <div className="person-chips">
        {personas.map((persona) => (
          <button
            key={persona.id}
            type="button"
            className="person-chip"
            onClick={() => onSelect(persona)}
          >
            <span className="person-chip-avatar" style={{ background: persona.color }}>
              {persona.nombre.charAt(0).toUpperCase()}
            </span>
            <span className="person-chip-name">{persona.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PersonSelector
