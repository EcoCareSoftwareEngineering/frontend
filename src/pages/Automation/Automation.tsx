import { TAutomation, TAutomationEvent } from '../../types/automationTypes'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { API } from '../../utils'
import './Automation.scss'
import Devices from '../Devices/Devices'

const Device = () => {
  const [automationEvents, setAutomationEvents] = useState<TAutomationEvent[]>()
  const [automations, setAutomations] = useState<TAutomation[]>()
  const [isLoading, setIsLoading] = useState<Boolean>(false)

  useEffect(() => {
    API.get('/automations/').then((response: any) => {
      const newAutomations = response.data.map((automation: TAutomation) => ({
        ...automation,
        dateTime: new Date(automation.dateTime),
      }))

      setAutomations(newAutomations)
      setAutomationEvents(
        newAutomations.map((automation: TAutomation) => ({
          id: automation.automationId,
          start: automation.dateTime.toISOString(),
          end: new Date(
            automation.dateTime.getTime() + 60 * 60 * 1000
          ).toISOString(),
          title: `${automation.deviceId} set ${automation.newState[0].fieldName} to ${automation.newState[0].value}`,
        }))
      )
    })
  }, [])

  useEffect(() => {
    if (automations) console.log(automations)
  }, [automations])

  useEffect(() => {
    if (automationEvents) console.log(automationEvents)
  }, [automationEvents])

  return (
    <div className='automation'>
      <h2>Automation {automationEvents?.length}</h2>
      {automationEvents && automationEvents.length > 0 && (
        <FullCalendar
          eventContent={automationEvents}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={'dayGridMonth'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
        />
      )}
    </div>
  )
}

export default Device
