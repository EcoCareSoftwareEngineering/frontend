import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { API } from '../../utils'
import './Automation.scss'

const Device = () => {
  const [currentView, setCurrentView] = useState('dayGridMonth')

  return (
    <div className='automation'>
      <h2>Automation</h2>
      <div className='flex space-x-2 mb-4'>
        <Button onClick={() => setCurrentView('dayGridMonth')}>Month</Button>
        <Button onClick={() => setCurrentView('timeGridWeek')}>Week</Button>
        <Button onClick={() => setCurrentView('timeGridDay')}>Day</Button>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        key={currentView} // Ensures re-render when view changes
      />
    </div>
  )
}

export default Device
