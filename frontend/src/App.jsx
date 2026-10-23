import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Materias from './pages/Materias'
import Tarefas from './pages/Tarefas'
import Cronograma from './pages/Cronograma'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/materias" element={<Materias />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/cronograma" element={<Cronograma />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}