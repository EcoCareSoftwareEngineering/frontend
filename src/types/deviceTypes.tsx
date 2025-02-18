export interface TDevice {
  deviceId: number
  name: string
  description?: string
  location?: string
  unlocked?: boolean
  ipAddress?: string
  pinEnabled?: boolean
  uptimeTimestamp?: null
  state: TDeviceState[]
  status: 'On' | 'Off'
  faultStatus: 'Ok' | 'Fault'
}

export interface TDeviceState {
  dataType: string
  fieldName: string
  value: number
}
