export interface TDevice {
  deviceId: number
  name: string
  description?: string
  roomTag?: number
  location?: string
  unlocked?: boolean
  ipAddress?: string
  pinEnabled?: boolean
  uptimeTimestamp?: null
  state: TDeviceState[]
  status: 'On' | 'Off'
  faultStatus: 'Ok' | 'Fault'
  customTags: number[]
  userTags: number[]
}

export interface TDeviceState {
  fieldName: 'integer' | 'float' | 'string' | 'boolean'
  value?: number | string | boolean
  datatype: string
}

export interface TTag {
  tagType: 'Room' | 'User' | 'Custom'
  tagId: number
  name: string
}

export interface TDeviceFaults {
  okCount: number
  faultCount: number
}

export interface TDeviceUsage {
  datetime: Date
  usage: number
}

export type TAllDeviceUsages = {
  deviceId: number
  usage: TDeviceUsage[]
}[]

export type TUsagesByRoom = {
  label?: string
  roomTag: number
  totalUsage: number
  usage: TDeviceUsage[]
}[]

export type TDevicesByRooms = {
  roomTag: number
  devices: number[]
}[]
