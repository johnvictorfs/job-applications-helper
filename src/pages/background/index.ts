import { storageKeys, messageEvent, type AutoFillItem } from "@src/shared";

const menuId = {
  applicationFill: {
    id: 'applicationFill',
    title: 'Application Fill',
  }
} as const

chrome.contextMenus.create({
  "id": menuId.applicationFill.id,
  "title": menuId.applicationFill.title,
  "contexts": ["editable"]
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === messageEvent.requestUpdateAutoFill) {
    chrome.storage.sync.get(storageKeys.autoFills, (data) => {
      const autoFills = data[storageKeys.autoFills] as AutoFillItem[]
    
      updateAutoFills(autoFills)
    })

    chrome.storage.sync.get(storageKeys.autoFillKeybind, (data) => {
      const autoFillKeybind = data[storageKeys.autoFillKeybind] as string

      updateAutoFillKeybind(autoFillKeybind)
    })
  }
})

chrome.storage.sync.get(storageKeys.autoFills, (data) => {
  const autoFills = data[storageKeys.autoFills] as AutoFillItem[]

  updateAutoFills(autoFills)

  autoFills.forEach((autoFill) => {
    chrome.contextMenus.create({
      "id": autoFill.key,
      "parentId": menuId.applicationFill.id,
      "title": autoFill.key,
      "contexts": ["editable"]
    });
  })
})

const updateAutoFills = (autoFills: AutoFillItem[]) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: messageEvent.autoFillUpdated,
        autoFills
      })
    }
  });
}

const updateAutoFillKeybind = (keybind: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: messageEvent.updateAutoFillKeybind,
        autoFillKeybind: keybind
      })
    }
  });
}

chrome.storage.onChanged.addListener((changes) => {
  for (const [key, { newValue, oldValue }] of Object.entries(changes)) {
    if (key === storageKeys.autoFillKeybind) {
      updateAutoFillKeybind(newValue as string)
    }

    if (key === storageKeys.autoFills) {
      const oldAutoFills = oldValue as AutoFillItem[]
      oldAutoFills.forEach((autoFill) => {
        chrome.contextMenus.remove(autoFill.key)
      })

      const autoFills = newValue as AutoFillItem[]
      autoFills.forEach((autoFill) => {
        chrome.contextMenus.create({
          "id": autoFill.key,
          "parentId": menuId.applicationFill.id,
          "title": autoFill.key,
          "contexts": ["editable"]
        });
      })

      updateAutoFills(autoFills)
    }
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.parentMenuItemId === menuId.applicationFill.id) {
    if (!tab?.id) {
      return
    }

    chrome.storage.sync.get(storageKeys.autoFills, (data) => {
      const autoFills = data[storageKeys.autoFills] as AutoFillItem[]
      const selectedAutoFill = autoFills.find((autoFill) => autoFill.key === info.menuItemId)

      if (selectedAutoFill && tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: messageEvent.submitAutoFill, autoFill: selectedAutoFill.value })
      }
    })
  }
})
