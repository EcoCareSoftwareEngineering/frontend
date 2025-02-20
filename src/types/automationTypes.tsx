import { TDevice, TDeviceState } from './deviceTypes'

export interface TAutomation {
  automationId: number
  deviceId: number
  dateTime: Date
  newState: TDeviceState[]
}

export interface TAutomationEvent {
  id: string
  end: string
  start: string
  title: string
  allDay?: false
  device?: TDevice
  extendedProps?: any
}
