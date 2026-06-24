export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-paper mb-1">ObrasDeSolitario</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
            Archivo no oficial de la discografía de Solitario.
          </p>
        </div>
        <div className="text-center md:text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600">
            Proyecto de preservación y recuperación de obras eliminadas.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-600 mt-1">
            Hecho por fans, para fans. ❤️
          </p>
        </div>
      </div>
    </footer>
  )
}