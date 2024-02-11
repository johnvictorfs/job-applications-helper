import { useEffect, useState } from "react";
import { storageKeys, type AutoFillItem } from "@src/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash } from "@/assets/icons/Trash";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
 
export function AutoFillOptions() {
  const [newAutoFill, setNewAutoFill] = useState<AutoFillItem>({ key: '', value: '' })
  const [autoFills, setAutoFills] = useState<AutoFillItem[]>([])
  const [autoFillKeybind, setAutoFillKeybind] = useState<string | null>()

  const updateAutoFillKeybind = (key: string | null) => {
    chrome.storage.sync.set({ [storageKeys.autoFillKeybind]: key })
  }

  useEffect(() => {
    const changeListener = (changes: { [key: string]: chrome.storage.StorageChange; }) => {
      for (const [key, { newValue }] of Object.entries(changes)) {
        if (key === storageKeys.autoFills) {
          setAutoFills(newValue)
        }

        if (key === storageKeys.autoFillKeybind) {
          setAutoFillKeybind(newValue)
        }
      }
    }

    chrome.storage.onChanged.addListener(changeListener);

    chrome.storage.sync.get(storageKeys.autoFills, (data) => {
      if (data[storageKeys.autoFills]) {
        setAutoFills(data[storageKeys.autoFills])
      }
    })

    chrome.storage.sync.get(storageKeys.autoFillKeybind, (data) => {
      if (data[storageKeys.autoFillKeybind]) {
        setAutoFillKeybind(data[storageKeys.autoFillKeybind])
      }
    })

    return () => {
      chrome.storage.onChanged.removeListener(changeListener);
    }
  }, [])

  const addAutoFill = () => {
    if (newAutoFill.key && newAutoFill.value) {
      if (autoFills.find((autoFill) => autoFill.key === newAutoFill.key)) {
        alert(`AutoFill with key ${newAutoFill.key} already exists`)
        return
      }

      chrome.storage.sync.set({ [storageKeys.autoFills]: [...autoFills, newAutoFill] })
      setNewAutoFill({ key: '', value: '' })
    }
  }

  const removeAutoFill = (key: string) => {
    if (confirm(`Are you sure you want to remove '${key}'?`)) {
      const newAutoFills = autoFills.filter((autoFill) => autoFill.key !== key)
      chrome.storage.sync.set({ [storageKeys.autoFills]: newAutoFills })
    }
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 h-full p-3 overflow-y-auto">
      <header className="flex flex-col text-white">
        <Label htmlFor="keybind">Auto-fill keybind</Label>
        <div className="flex items-center justify-center">
          <kbd className="mt-3 bg-muted px-2 mx-2 font-mono text-[12px] font-medium text-muted-foreground opacity-100 rounded-md w-32">
            Ctrl / Cmd
          </kbd>
          <Input
            id="keybind"
            value={autoFillKeybind ?? ''}
            onChange={(e) => {
              updateAutoFillKeybind(e.target.value.trim().toLowerCase().charAt(0) || null)
            }}
            placeholder="AutoFill Keybind"
            className="mt-3 p-2"
          />
        </div>

        <Separator className="my-3" />

        <Input
          value={newAutoFill?.key ?? ''}
          onChange={(e) => setNewAutoFill({ ...newAutoFill, key: e.target.value })}
          placeholder="Key (ex.: LinkedIn Url)"
          className="p-2"
        />

        <Input
          value={newAutoFill?.value ?? ''}
          onChange={(e) => setNewAutoFill({ ...newAutoFill, value: e.target.value })}
          placeholder="Value"
          className="mt-3 p-2"
        />

        <Button onClick={addAutoFill} disabled={!addAutoFill} className="py-2 mt-2">
          Add AutoFill
        </Button>

        <div className="flex flex-col">
          {autoFills.map((autoFill) => (
            <Alert key={autoFill.key} className="w-full mt-2">
              <AlertTitle className="font-bold">
                {autoFill.key}
              </AlertTitle>

              <AlertDescription>
                {autoFill.value}
              </AlertDescription>

              <div className="absolute top-4 right-4">
                <Button size="icon" variant="outline" onClick={() => removeAutoFill(autoFill.key)}>
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      </header>
    </div>
  );
}
