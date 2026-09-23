import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import PersonSelector from './components/PersonSelector.jsx'
import Board from './components/Board.jsx'
import './App.css'

const QUIEN_SOY_KEY = 'quienSoy'

function App() {
  const [personas, setPersonas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [quienSoy, setQuienSoy] = useState(() => {
    const guardado = localStorage.getItem(QUIEN_SOY_KEY)
    return guardado ? JSON.parse(guardado) : null
  })

  useEffect(() => {
    const cargarPersonas = async () => {
      const { data, error } = await supabase.from('personas').select('*').order('nombre')
      if (!error) setPersonas(data ?? [])
      setCargando(false)
    }
    cargarPersonas()
  }, [])

  const seleccionarPersona = (persona) => {
    localStorage.setItem(QUIEN_SOY_KEY, JSON.stringify(persona))
    setQuienSoy(persona)
  }

  const cambiarPersona = () => {
    localStorage.removeItem(QUIEN_SOY_KEY)
    setQuienSoy(null)
  }

  if (cargando) {
    return <p className="board-status">Cargando...</p>
  }

  if (!quienSoy) {
    return <PersonSelector personas={personas} onSelect={seleccionarPersona} />
  }

  return <Board quienSoy={quienSoy} onCambiarPersona={cambiarPersona} />
}

export default App
