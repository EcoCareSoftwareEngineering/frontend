import { Tag } from './generalTypes'

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
  customTags: Tag[]
  userTags: Tag[]
}

export interface TDeviceState {
  fieldName: 'integer' | 'float' | 'string' | 'boolean'
  value?: number | string | boolean
  datatype: string
}
