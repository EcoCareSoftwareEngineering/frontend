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
  fieldName: string
  value?: number | string | boolean
  datatype: 'integer' | 'float' | 'string' | 'boolean'
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

export interface TDevicePower {
  powerOn: number
  powerOff: number
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
