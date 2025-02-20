import { TDeviceState } from './deviceTypes'

export interface TAutomation {
  automationId: number
  deviceId: number
  dateTime: Date
  newState: TDeviceState[]
}

export interface TAutomationEvent {
  id: string
  title: string
  start: string
  end: string
  extendedProps?: any
  allDay?: false
}
