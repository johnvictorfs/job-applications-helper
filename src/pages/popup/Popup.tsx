import { useEffect, useState } from "react";
import { autoFillStorageKey, type AutoFillItem } from "@src/shared";

export default function Popup(): JSX.Element {
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
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800 overflow-y-auto">
      <header className="flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl">AutoFill</h1>
        <input
          value={newAutoFill?.key ?? ''}
          onChange={(e) => setNewAutoFill({ ...newAutoFill, key: e.target.value })}
          placeholder="Key (ex.: LinkedIn Url)"
          className="mt-3 p-2 text-black rounded"
        />

        <input
          value={newAutoFill?.value ?? ''}
          onChange={(e) => setNewAutoFill({ ...newAutoFill, value: e.target.value })}
          placeholder="Value"
          className="mt-3 p-2 text-black rounded"
        />

        <button
          onClick={addAutoFill}
          disabled={!addAutoFill}
          className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add AutoFill
        </button>

        <ul className="mt-3">
          {autoFills.map((autoFill) => (
            <li key={autoFill.key} className="flex flex-col items-center justify-center text-white bg-gray-700 p-2 rounded mt-2">
              <div className="text-blue-500">{autoFill.key}</div>
              <div className="text-gray-400">{autoFill.value}</div>
              <div className="text-red-500 cursor-pointer pl-4" onClick={() => removeAutoFill(autoFill.key)}>🗑️</div>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}
