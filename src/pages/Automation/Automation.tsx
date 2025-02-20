import { EventClickArg, EventContentArg } from '@fullcalendar/core/index.js'
import { TAutomation, TAutomationEvent } from '../../types/automationTypes'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { enqueueSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { API } from '../../utils'
import './Automation.scss'

const Device = () => {
  const [automationEvents, setAutomationEvents] = useState<TAutomationEvent[]>()
  const [automations, setAutomations] = useState<TAutomation[]>()
  const [isLoading, setIsLoading] = useState<Boolean>(false)

  useEffect(() => {
    API.get('/automations/')
      .then((response: any) => {
        const newAutomations = response.data.map((automation: TAutomation) => ({
          ...automation,
          dateTime: new Date(automation.dateTime),
        }))

        setAutomations(newAutomations)
        setAutomationEvents(
          newAutomations.map((automation: TAutomation) => ({
            id: automation.automationId.toString(),
            start: automation.dateTime.toISOString(),
            end: automation.dateTime.toISOString(),
            title: `${automation.deviceId} set ${automation.newState[0].fieldName} to ${automation.newState[0].value}`,
          }))
        )
      })
      .catch((err: any) => {
        enqueueSnackbar(err.message ?? 'Error fetching automations', {
          variant: 'error',
          preventDuplicate: true,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
  }, [])

  useEffect(() => {
    if (automations) console.log(automations)
  }, [automations])

  useEffect(() => {
    if (automationEvents) console.log(automationEvents)
  }, [automationEvents])

  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Display event modal to update/delete', clickInfo)
  }

  return (
    <div className='automation'>
      <h2>Automations</h2>
      {automationEvents && automationEvents.length > 0 && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={'dayGridMonth'}
          initialEvents={automationEvents}
          eventClick={handleEventClick}
          eventContent={(eventInfo: EventContentArg) => (
            <>
              <b>{eventInfo.timeText}:&nbsp;</b>
              <i>{eventInfo.event.title}</i>
            </>
          )}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short', // 'short' for AM/PM, or use 'narrow'/'long'
          }}
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
