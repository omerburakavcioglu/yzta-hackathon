'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  onSend: (message: string) => Promise<string>
  placeholder?: string
  title?: string
  emptyText?: string
}

export default function ChatPanel({
  onSend,
  placeholder = 'Ask something...',
  title = 'AI Assistant',
  emptyText = 'Ask me anything about your orders, inventory, or shipments.',
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const answer = await onSend(text)
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-white dark:to-gray-800">
        <Bot className="w-5 h-5 text-blue-500" />
        <span className="font-semibold text-gray-800 dark:text-white">{title}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[480px]">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm mt-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            {emptyText}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`rounded-full p-1.5 flex-shrink-0 ${m.role === 'user' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
              {m.role === 'user'
                ? <User className="w-3.5 h-3.5 text-white" />
                : <Bot className="w-3.5 h-3.5 text-gray-600 dark:text-gray-200" />
              }
            </div>
            <div
              className={`px-3 py-2 rounded-xl text-sm max-w-[80%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white rounded-tr-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="rounded-full p-1.5 bg-gray-200 dark:bg-gray-600">
              <Bot className="w-3.5 h-3.5 text-gray-600 dark:text-gray-200" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400 rounded-tl-none">
              ...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <input
          className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-40 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
