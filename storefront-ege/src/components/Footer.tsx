import EgeLogo from './EgeLogo'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-olive-100 bg-olive-900 text-olive-100">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <EgeLogo size={36} />
            <div className="font-serif text-lg font-bold">Ege Zeytinyağı Kooperatifi</div>
          </div>
          <p className="text-sm text-olive-200 leading-relaxed">
            Ege&apos;nin bereketli topraklarından, soğuk sıkım natürel sızma zeytinyağı.
            Üreticiden sofranıza, aracısız.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">İletişim</h4>
          <ul className="text-sm text-olive-200 space-y-1.5">
            <li>📞 +90 232 555 0101</li>
            <li>✉️ info@egezeytinyagi.com</li>
            <li>📍 Ayvalık, Balıkesir</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Yardım</h4>
          <ul className="text-sm text-olive-200 space-y-1.5">
            <li>Kargo &amp; Teslimat: 2-4 iş günü</li>
            <li>İade: 14 gün koşulsuz</li>
            <li>Sorularınız için sağ alttaki asistanı kullanabilirsiniz</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-olive-800 py-4 text-center text-xs text-olive-300">
        © {new Date().getFullYear()} Ege Zeytinyağı Kooperatifi · Koopilot ile güçlendirilmiştir
      </div>
    </footer>
  )
}
