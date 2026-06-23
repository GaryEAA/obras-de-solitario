import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import ObraDetalle from './pages/ObraDetalle'
import Recuperacion from './pages/Recuperacion'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/obras/:id" element={<ObraDetalle />} />
        <Route path="/recuperacion" element={<Recuperacion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App