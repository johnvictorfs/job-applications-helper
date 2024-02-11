export const messageEvent = {
  submitAutoFill: 'submitAutoFill',
  autoFillUpdated: 'autoFillUpdated',
  requestUpdateAutoFill: 'requestUpdateAutoFill',
  updateAutoFillKeybind: 'updateAutoFillKeybind',
} as const

export type MessageEvent = typeof messageEvent[keyof typeof messageEvent]

export type AutoFillItem = {
  key: string
  value: string
}

export const DEFAULT_AUTO_FILL_KEYBIND = 'm'

export const storageKeys = {
  autoFills: 'autoFills',
  autoFillKeybind: 'autoFillKeybind',
} as const
