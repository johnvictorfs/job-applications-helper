import { useEffect, useState } from "react";
import { autoFillStorageKey, type AutoFillItem } from "@src/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrashIcon } from "@radix-ui/react-icons"
 
export function AutoFillOptions() {
  const [newAutoFill, setNewAutoFill] = useState<AutoFillItem>({ key: '', value: '' })
  const [autoFills, setAutoFills] = useState<AutoFillItem[]>([])

  useEffect(() => {
    const changeListener = (changes: { [key: string]: chrome.storage.StorageChange; }) => {
      for (const [key, { newValue }] of Object.entries(changes)) {
        if (key === autoFillStorageKey) {
          setAutoFills(newValue)
        }
      }
    }

    chrome.storage.onChanged.addListener(changeListener);

    chrome.storage.sync.get(autoFillStorageKey, (data) => {
      if (data[autoFillStorageKey]) {
        setAutoFills(data[autoFillStorageKey])
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

      chrome.storage.sync.set({ [autoFillStorageKey]: [...autoFills, newAutoFill] })
      setNewAutoFill({ key: '', value: '' })
    }
  }

  const removeAutoFill = (key: string) => {
    if (confirm(`Are you sure you want to remove '${key}'?`)) {
      const newAutoFills = autoFills.filter((autoFill) => autoFill.key !== key)
      chrome.storage.sync.set({ [autoFillStorageKey]: newAutoFills })
    }
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 overflow-y-auto">
      <header className="flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl">AutoFill</h1>
        <Input
          value={newAutoFill?.key ?? ''}
          onChange={(e) => setNewAutoFill({ ...newAutoFill, key: e.target.value })}
          placeholder="Key (ex.: LinkedIn Url)"
          className="mt-3 p-2"
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

        <div className="flex flex-col items-center justify-center">
          {autoFills.map((autoFill) => (
            <Alert key={autoFill.key} className="w-full mt-2">
              <AlertTitle className="font-bold mr-14">
                {autoFill.key}
              </AlertTitle>

              <AlertDescription className="mr-14">
                {autoFill.value}
              </AlertDescription>

              <div className="absolute top-4 right-4">
                <Button size="icon" variant="outline" onClick={() => removeAutoFill(autoFill.key)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      </header>
    </div>
  );
}
