'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'

interface Msg { role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  'Hangi ürün düşük stokta?',
  'Soğuk sıkım ne demek?',
  'Kargo kaç günde gelir?',
  'Siparişimi takip etmek istiyorum',
]

export default function Chatbot() {
  const { customer } = useStore()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || sending) return
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setSending(true)
    try {
      const res = await api.chat({
        message: msg,
        customer_id: customer?.id,
      })
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Üzgünüm, şu an yanıt veremiyorum.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-olive-700 hover:bg-olive-800 text-white pl-4 pr-5 py-3.5 rounded-full shadow-xl shadow-olive-900/20 transition hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium text-sm">Yardımcı asistan</span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[min(380px,calc(100vw-3rem))] h-[min(560px,calc(100vh-4rem))] bg-white rounded-2xl shadow-2xl border border-olive-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-olive-800 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-olive-600 p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm">Ege Asistanı</div>
                <div className="text-[11px] text-olive-200">
                  {customer ? `${customer.full_name.split(' ')[0]} için aktif` : 'Misafir modu'}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-olive-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-cream-50 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-ink-500 py-4">
                <div className="text-3xl mb-2">🫒</div>
                <p className="mb-4">Merhaba! Ürünler, siparişler ve teslimat hakkında size yardımcı olabilirim.</p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full text-left text-xs text-olive-700 bg-white hover:bg-olive-50 border border-olive-200 rounded-lg px-3 py-2 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-olive-700 text-white rounded-br-sm'
                    : 'bg-white border border-olive-100 text-ink-900 rounded-bl-sm shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-olive-100 px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-olive-600" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); send() }}
            className="border-t border-olive-100 bg-white p-3 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Bir şey sor..."
              className="flex-1 text-sm bg-cream-50 border border-olive-100 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-olive-300 placeholder-ink-400"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-olive-700 hover:bg-olive-800 disabled:opacity-50 text-white p-2.5 rounded-full transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
