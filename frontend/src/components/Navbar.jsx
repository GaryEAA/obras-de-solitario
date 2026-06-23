import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/recuperacion', label: 'Recuperación' },
  ]

  return (
    <nav className="bg-surface border-b border-line px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 gap-3">
      <Link to="/" className="font-display font-extrabold text-base sm:text-xl tracking-tight text-side-artist whitespace-nowrap">
        ObrasDeSolitario
      </Link>
      <div className="flex gap-4 sm:gap-6 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-xs sm:text-sm font-medium font-mono uppercase tracking-wide whitespace-nowrap transition-colors ${
              pathname === link.to
                ? 'text-side-artist'
                : 'text-gray-400 hover:text-paper'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}