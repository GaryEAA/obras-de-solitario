import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import ObraDetalle from './pages/ObraDetalle'
import Recuperacion from './pages/Recuperacion'
import Login from './pages/Login'
import Admin from './pages/Admin'
import AdminArtistas from './pages/AdminArtistas'
import AdminBeatmakers from './pages/AdminBeatmakers'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/obras/:id" element={<ObraDetalle />} />
            <Route path="/recuperacion" element={<Recuperacion />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/artistas" element={<AdminArtistas />} />
            <Route path="/admin/beatmakers" element={<AdminBeatmakers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default App