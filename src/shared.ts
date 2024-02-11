export const messageEvent = {
  submitAutoFill: 'submitAutoFill',
  autoFillUpdated: 'autoFillUpdated',
  requestUpdateAutoFill: 'requestUpdateAutoFill',
} as const

export type MessageEvent = typeof messageEvent[keyof typeof messageEvent]

export type AutoFillItem = {
  key: string
  value: string
}

export const autoFillStorageKey = 'autoFills'
