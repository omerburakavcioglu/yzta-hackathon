import Link from 'next/link'
import { ArrowRight, Leaf } from 'lucide-react'

export default function StoryPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-cream-100 via-cream-50 to-olive-50">
        <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="text-6xl mb-6">🌿</div>
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" />
            1958'den beri Ayvalık'ta
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-olive-900 font-bold mb-6">
            Dört nesil, aynı zeytinlikler
          </h1>
          <p className="text-lg text-ink-700 leading-relaxed">
            Ege Zeytinyağı Kooperatifi, dedelerimizin diktiği aynı ağaçların altında
            bugün hâlâ aynı titizlikle çalışıyor.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-ink-700 leading-relaxed">
        <Block title="Toprak">
          Ayvalık ve Edremit körfezi, dünyada zeytinin en mutlu olduğu birkaç bölgeden biri.
          Tuzlu deniz havası, ılık kışlar, sıcak ama nemli yazlar — meyveye o eşsiz aromayı veren tam da bu denge.
        </Block>
        <Block title="Hasat">
          Ekim ortasından Aralık başına kadar, tüm köy ağaçlara çıkar. Zeytinler yere düşmeden,
          serili filelerin üzerine sırıkla silkelenerek toplanır. Zedelenme yok, zaman kaybı yok.
        </Block>
        <Block title="Soğuk Sıkım">
          Hasattan en geç 12 saat içinde zeytinler değirmene gider. 27°C'nin altında, su katılmadan
          sıkılır. Bu yöntemde verim daha düşüktür ama polifenol ve aroma çok daha yüksektir.
        </Block>
        <Block title="Kooperatif">
          42 küçük üretici aileyiz. Her hasat sonunda gelir ortak havuzda toplanır ve emek payına göre
          dağıtılır. Aracı yok, sömürü yok, taze yağ doğrudan sizin sofranıza ulaşır.
        </Block>

        <div className="bg-olive-50 border border-olive-200 rounded-2xl p-6 text-center">
          <p className="font-serif text-xl text-olive-900 mb-4">
            Bizi denemek ister misiniz?
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 bg-olive-700 hover:bg-olive-800 text-white px-5 py-2.5 rounded-xl font-medium transition"
          >
            Ürünleri Keşfet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-olive-800 font-bold mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  )
}
