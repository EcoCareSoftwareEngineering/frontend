export interface Device {
  name: string
  deviceId: number
  description?: string
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
