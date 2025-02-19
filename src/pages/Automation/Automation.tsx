import { TViewOptions, TAutomation } from '../../types/automationTypes'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { API } from '../../utils'
import './Automation.scss'

const Device = () => {
  const [currentView, setCurrentView] = useState<TViewOptions>('dayGridMonth')
  const [automations, setAutomations] = useState<TAutomation[]>()
  const [isLoading, setIsLoading] = useState<Boolean>(false)

  useEffect(() => {
    API.get('/automations/').then((response: any) => {
      setAutomations(
        response.data.map((automation: TAutomation) => ({
          ...automation,
          dateTime: new Date(automation.dateTime),
        }))
      )
    })
  }, [])

  useEffect(() => {
    if (automations) console.log(automations)
  }, [automations])

  return (
    <div className='automation'>
      <h2>Automation</h2>
      <div className='calendar flex space-x-2 mb-4'>
        <Button onClick={() => setCurrentView('dayGridMonth')}>Month</Button>
        <Button onClick={() => setCurrentView('timeGridWeek')}>Week</Button>
        <Button onClick={() => setCurrentView('timeGridDay')}>Day</Button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        key={currentView}
      />
    </div>
  )
}

export default Device
