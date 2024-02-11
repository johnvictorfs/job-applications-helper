import '@/assets/styles/tailwind.css'
import { messageEvent, type AutoFillItem } from '@src/shared';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function AutoCompleteCommand() {
  const [open, setOpen] = useState(false)
  const [autoFills, setAutoFills] = useState<AutoFillItem[]>([])
  const activeElement = useRef(document.activeElement as HTMLElement)

  const requestUpdateAutoFill = () => {
    chrome.runtime.sendMessage({ action: messageEvent.requestUpdateAutoFill })
  }

  useEffect(() => {
    requestUpdateAutoFill()

    const messageListener = (request: { action: string, autoFills: AutoFillItem[] }) => {
      if (request.action === messageEvent.autoFillUpdated) {
        setAutoFills(request.autoFills)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        requestUpdateAutoFill()
        const currentActiveElement = document.activeElement as HTMLElement
        activeElement.current = currentActiveElement

        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const submitAutoFill = (autoFill: AutoFillItem) => {
    if (activeElement.current && 'value' in activeElement.current) {
      activeElement.current.value = autoFill.value
      const event = new Event('input', { bubbles: true })
      activeElement.current.dispatchEvent(event)

      const changeEvent = new Event('change', { bubbles: true })
      activeElement.current.dispatchEvent(changeEvent)
      setOpen(false)
    }
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No auto-fill found.</CommandEmpty>
          <CommandGroup heading="Auto-fill">
            {autoFills?.map((autoFill) => (
              <CommandItem key={autoFill.key} onSelect={() => submitAutoFill(autoFill)}>
                <span>{autoFill.key}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

const rootElement = document.createElement('div')
rootElement.id = '__application-auto-complete_root'
document.body.appendChild(rootElement)

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <div className="__application-auto-complete_root">
      <AutoCompleteCommand />
    </div>
  </React.StrictMode>,
)

// chrome.runtime.onMessage.addListener((request) => {
//   if (request.action === messageEvent.submitAutoFill) {
//     const activeElement = document.activeElement as HTMLInputElement;

//     if (activeElement) {
//       activeElement.value = request.autoFill
//     }
//   }
// })
