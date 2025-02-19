import { TDeviceState } from './deviceTypes'

export interface TAutomation {
  automationId: number
  deviceId: number
  dateTime: Date
  newState: TDeviceState[]
}

export interface TAutomationEvent {
  id: number
  title: string
  start: Date
  end: Date
  extendedProps?: any
  allDay?: false
}
