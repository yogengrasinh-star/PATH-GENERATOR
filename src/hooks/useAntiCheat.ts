import { useEffect, useRef, useState } from 'react'
import type { ProctorEvent, ProctorEventType } from '../types'

export function useAntiCheat(active: boolean): { events: ProctorEvent[]; warnings: { id: number; message: string; title: string }[]; tabSwitchCount: number; dismissWarning: (id: number) => void } {
  const [events, setEvents] = useState<ProctorEvent[]>([]); const [warnings, setWarnings] = useState<{ id: number; message: string; title: string }[]>([]); const warningId = useRef(0)
  useEffect(() => { if (!active) return
    document.body.classList.add('no-select')
    const warn = (title: string, message: string) => { const id = ++warningId.current; setWarnings(current => [...current, { id, title, message }]) }
    const log = (type: ProctorEventType, title: string, message: string) => { setEvents(current => [...current, { type, timestamp: Date.now() }]); warn(title, message); if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(message)) } }
    const tab = () => { if (document.visibilityState === 'hidden') log('tab-switch', 'Tab switching detected', 'Warning. Tab switching detected. Please return to the diagnostic test.') }
    const copy = (event: ClipboardEvent) => { event.preventDefault(); log(event.type === 'cut' ? 'cut-attempt' : 'copy-attempt', 'Copy / paste detected', 'Warning. Copy and paste are disabled during the diagnostic test.') }
    const paste = (event: ClipboardEvent) => { event.preventDefault(); log('paste-attempt', 'Copy / paste detected', 'Warning. Copy and paste are disabled during the diagnostic test.') }
    const context = (event: MouseEvent) => { event.preventDefault(); log('context-menu-attempt', 'Copy / paste detected', 'Warning. Copy and paste are disabled during the diagnostic test.') }
    const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && ['c', 'x', 'v'].includes(event.key.toLowerCase())) { event.preventDefault(); log(event.key.toLowerCase() === 'x' ? 'cut-attempt' : event.key.toLowerCase() === 'v' ? 'paste-attempt' : 'copy-attempt', 'Copy / paste detected', 'Warning. Copy and paste are disabled during the diagnostic test.') } }
    document.addEventListener('visibilitychange', tab); document.addEventListener('copy', copy); document.addEventListener('cut', copy); document.addEventListener('paste', paste); document.addEventListener('selectstart', event => event.preventDefault()); document.addEventListener('contextmenu', context); document.addEventListener('keydown', key)
    return () => { document.body.classList.remove('no-select'); document.removeEventListener('visibilitychange', tab); document.removeEventListener('copy', copy); document.removeEventListener('cut', copy); document.removeEventListener('paste', paste); document.removeEventListener('contextmenu', context); document.removeEventListener('keydown', key); if ('speechSynthesis' in window) window.speechSynthesis.cancel() }
  }, [active])
  return { events, warnings, tabSwitchCount: events.filter(event => event.type === 'tab-switch').length, dismissWarning: id => setWarnings(current => current.filter(warning => warning.id !== id)) }
}