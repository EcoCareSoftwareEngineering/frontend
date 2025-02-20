import { EventClickArg, EventContentArg } from '@fullcalendar/core/index.js'
import { TAutomation, TAutomationEvent } from '../../types/automationTypes'
import { useDevices } from '../../contexts/DeviceContext'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import { CircularProgress } from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import { useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { API } from '../../utils'
import './Automation.scss'

const Automation = () => {
  const [automationEvents, setAutomationEvents] = useState<TAutomationEvent[]>()
  const [automations, setAutomations] = useState<TAutomation[]>()
  const [isLoading, setIsLoading] = useState<Boolean>(true)
  const { devices, devicesLoaded } = useDevices()

  useEffect(() => {
    setIsLoading(true)
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
    if (automations && automations.length > 0) {
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
      setIsLoading(false)
    }
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
      {isLoading && <CircularProgress size={100} className='loading' />}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        navLinks={true}
        events={automationEvents}
        initialView={'dayGridMonth'}
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
          meridiem: 'short',
        }}
        headerToolbar={{
          center: 'title',
          left: 'prev,next today',
          right: 'dayGridMonth,timeGridWeek,timeGridDay myCustomButton',
        }}
        customButtons={{
          myCustomButton: {
            text: 'Add Automation',
          },
        }}
      />
    </div>
  )
}

export default Automation
