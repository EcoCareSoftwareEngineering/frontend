import { EventClickArg, EventContentArg } from '@fullcalendar/core/index.js'
import { TAutomation, TAutomationEvent } from '../../types/automationTypes'
import { useDevices } from '../../contexts/DeviceContext'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { enqueueSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { API } from '../../utils'
import './Automation.scss'

const Automation = () => {
  const [automationEvents, setAutomationEvents] = useState<TAutomationEvent[]>()
  const [automations, setAutomations] = useState<TAutomation[]>()
  const [isLoading, setIsLoading] = useState<Boolean>(false)
  const { devices, devicesLoaded } = useDevices()

  useEffect(() => {
    if (!devicesLoaded) return

    API.get('/automations/')
      .then((response: any) => {
        setAutomations(
          response.data.map((automation: TAutomation) => ({
            ...automation,
            dateTime: new Date(automation.dateTime),
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
  }, [devicesLoaded])

  useEffect(() => {
    if (automations && automations.length > 0)
      setAutomationEvents(
        automations.map((automation: TAutomation) => {
          const device = devices.find(
            item => item.deviceId === automation.deviceId
          )
          return {
            device: device,
            title: `${device?.name}`,
            id: automation.automationId.toString(),
            end: automation.dateTime.toISOString(),
            start: automation.dateTime.toISOString(),
          }
        })
      )
  }, [automations])

  useEffect(() => {
    if (automations) console.log('Automations', automations)
  }, [automations])

  useEffect(() => {
    if (automationEvents) console.log('Automation events', automationEvents)
  }, [automationEvents])

  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Display event modal to update/delete', clickInfo)
  }

  return (
    <div className='automation'>
      <h2>Automations</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={'dayGridMonth'}
        events={automationEvents}
        eventClick={handleEventClick}
        eventContent={(eventInfo: EventContentArg) => (
          <div className='event-content'>
            <b>{eventInfo.timeText}:&nbsp;</b>
            <i>{eventInfo.event.title}</i>
          </div>
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
    </div>
  )
}

export default Automation
