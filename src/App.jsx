import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import PersonSelector from './components/PersonSelector.jsx'
import Board from './components/Board.jsx'
import Overview from './components/Overview.jsx'
import './App.css'

const QUIEN_SOY_KEY = 'quienSoy'

function App() {
  const [personas, setPersonas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState('personal')
  const [quienSoy, setQuienSoy] = useState(() => {
    const guardado = localStorage.getItem(QUIEN_SOY_KEY)
    return guardado ? JSON.parse(guardado) : null
  })

  const cargarPersonas = async () => {
    const { data, error } = await supabase.from('personas').select('*').order('nombre')
    if (!error) setPersonas(data ?? [])
    return error
  }

  useEffect(() => {
    const inicial = async () => {
      await cargarPersonas()
      setCargando(false)
    }
    inicial()
  }, [])

  const seleccionarPersona = (persona) => {
    localStorage.setItem(QUIEN_SOY_KEY, JSON.stringify(persona))
    setQuienSoy(persona)
  }

  const cambiarPersona = () => {
    localStorage.removeItem(QUIEN_SOY_KEY)
    setQuienSoy(null)
    setVista('personal')
  }

  if (cargando) {
    return <p className="board-status">Cargando...</p>
  }

  if (!quienSoy) {
    return <PersonSelector personas={personas} onSelect={seleccionarPersona} />
  }

  if (vista === 'general') {
    return (
      <Overview
        personas={personas}
        onPersonasChange={cargarPersonas}
        onVolver={() => setVista('personal')}
      />
    )
  }

  return (
    <Board
      quienSoy={quienSoy}
      onCambiarPersona={cambiarPersona}
      onVerTodas={() => setVista('general')}
    />
  )
}

export default App
