export interface Device {
  deviceId: number
  name: string
  description?: string
  location?: string
  unlocked?: boolean
  ipAddress?: string
  pinEnabled?: boolean
  uptimeTimestamp?: null
  state: DeviceState[]
  status: 'On' | 'Off'
  faultStatus: 'Ok' | 'Fault'
}

export interface DeviceState {
  dataType: string
  fieldName: string
  value: number
}
