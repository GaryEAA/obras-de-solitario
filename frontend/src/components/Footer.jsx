export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-500 text-sm">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold mb-1">ObrasDeSolitario</p>
          <p>Archivo no oficial de la discografía de Solitario.</p>
        </div>
        <div className="text-center md:text-right">
          <p>Proyecto de preservación y recuperación de obras eliminadas.</p>
          <p className="mt-1">Hecho por FreeStayJleP, para fans. ❤️</p>
        </div>
      </div>
    </footer>
  )
}