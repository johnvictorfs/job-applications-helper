import { messageEvent, type AutoFillItem, DEFAULT_AUTO_FILL_KEYBIND } from '@src/shared';
import { useEffect, useRef, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

export function AutoCompleteCommand() {
  const [open, setOpen] = useState(false);
  const [autoFills, setAutoFills] = useState<AutoFillItem[]>([]);
  const activeElement = useRef(document.activeElement as HTMLElement);
  const [autoFillKeybind, setAutoFillKeybind] = useState<string | null>();

  const requestUpdateAutoFill = () => {
    chrome.runtime.sendMessage({ action: messageEvent.requestUpdateAutoFill });
  };

  useEffect(() => {
    requestUpdateAutoFill();

    const messageListener = (request: { action: string; autoFills: AutoFillItem[]; autoFillKeybind: string; }) => {
      if (request.action === messageEvent.autoFillUpdated) {
        setAutoFills(request.autoFills);
      }

      if (request.action === messageEvent.updateAutoFillKeybind) {
        setAutoFillKeybind(request.autoFillKeybind);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === (autoFillKeybind || DEFAULT_AUTO_FILL_KEYBIND) && (e.metaKey || e.ctrlKey)) {
        requestUpdateAutoFill();
        const currentActiveElement = document.activeElement as HTMLElement;
        activeElement.current = currentActiveElement;
        e.preventDefault();
        if (activeElement.current && 'value' in activeElement.current) {
          setOpen((open) => !open);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [autoFillKeybind]);

  const submitAutoFill = (autoFill: AutoFillItem) => {
    if (activeElement.current && 'value' in activeElement.current) {
      activeElement.current.value = autoFill.value;
      const event = new Event('input', { bubbles: true });
      activeElement.current.dispatchEvent(event);

      const changeEvent = new Event('change', { bubbles: true });
      activeElement.current.dispatchEvent(changeEvent);
      setOpen(false);
    }
  };

  const portalContainer = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={portalContainer} />

      <CommandDialog open={open} onOpenChange={setOpen} portalContainer={portalContainer.current}>
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
  );
}

export default AutoCompleteCommand
