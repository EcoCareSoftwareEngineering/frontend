import { TDeviceState } from './deviceTypes'

export type TViewOptions = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

export interface TAutomation {
  automationId: number
  deviceId: number
  dateTime: Date
  newState: TDeviceState[]
}
