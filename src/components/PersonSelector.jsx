import { hexToRgba } from '../utils/color.js'

const TAGLINES = [
  'Gestiona tus tareas',
  'Organiza tu día',
  'Mantén el enfoque',
  'Suma un logro más',
  'Hazlo con estilo',
]

const ICONOS = ['📋', '🗓️', '🎯', '✅', '⭐']

function PersonSelector({ personas, onSelect }) {
  return (
    <div className="page-shell person-selector">
      <div className="bg-blob bg-blob-a" />
      <div className="bg-blob bg-blob-b" />
      <div className="selector-card">
        <div className="bg-dots" />
        <div className="selector-topbar">
          <div className="brand-badge">
            <span className="brand-badge-icon">📋</span>
            <span className="brand-badge-title">Tablero del equipo</span>
          </div>
          <nav className="selector-nav">
            <span>Organiza</span>
            <span className="dot">·</span>
            <span>Colabora</span>
            <span className="dot">·</span>
            <span>Avanza</span>
          </nav>
        </div>

        <div className="selector-hero">
          <div className="hero-badge">
            <span>📋</span>
            <span className="hero-sparkle hero-sparkle-a">✦</span>
            <span className="hero-sparkle hero-sparkle-b">✦</span>
          </div>
          <h1>Tablero del equipo</h1>
          <p>Selecciona tu perfil para organizar tus tareas</p>
        </div>

        <div className="person-chips">
          {personas.map((persona, index) => (
            <button
              key={persona.id}
              type="button"
              className="person-chip"
              style={{ background: hexToRgba(persona.color, 0.12) }}
              onClick={() => onSelect(persona)}
            >
              <span className="person-chip-avatar" style={{ background: persona.color }}>
                {persona.nombre.charAt(0).toUpperCase()}
              </span>
              <span className="person-chip-name">{persona.nombre}</span>
              <span className="person-chip-tagline">{TAGLINES[index % TAGLINES.length]}</span>
              <span
                className="person-chip-icon"
                style={{ background: hexToRgba(persona.color, 0.18), color: persona.color }}
              >
                {ICONOS[index % ICONOS.length]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PersonSelector
