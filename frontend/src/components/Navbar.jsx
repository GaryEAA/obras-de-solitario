import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/recuperacion', label: 'Recuperación' },
  ]

  const isAdmin = !!localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="bg-surface border-b border-line px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50 gap-4">
      <Link
        to="/"
        className="font-display font-extrabold text-base sm:text-lg tracking-tight text-side-artist whitespace-nowrap"
      >
        ObrasDeSolitario
      </Link>

      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors ${
              pathname === link.to
                ? 'text-side-artist'
                : 'text-gray-500 hover:text-paper'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {isAdmin ? (
          <div className="flex items-center gap-3 border-l border-line pl-4 ml-1">
            <Link to="/admin" className={`font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors ${pathname === '/admin' ? 'text-side-artist' : 'text-gray-500 hover:text-paper'}`}>
              Obras
            </Link>
            <Link to="/admin/artistas" className={`font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors ${pathname === '/admin/artistas' ? 'text-side-artist' : 'text-gray-500 hover:text-paper'}`}>
              Artistas
            </Link>
            <Link to="/admin/beatmakers" className={`font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors ${pathname === '/admin/beatmakers' ? 'text-side-prod' : 'text-gray-500 hover:text-paper'}`}>
              Beatmakers
            </Link>
            <button onClick={handleLogout} className="font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-side-artist transition-colors">
              Salir
            </button>
          </div>
        ) : (
          <Link to="/login" className="font-mono text-[11px] uppercase tracking-widest text-gray-600 hover:text-paper transition-colors border-l border-line pl-4 ml-1">
            Admin
          </Link>
        )}
      </div>
    </nav>
  )
}