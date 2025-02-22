import { EventClickArg, EventContentArg } from '@fullcalendar/core/index.js'
import { TAutomation, TAutomationEvent } from '../../types/automationTypes'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { TDevice, TDeviceState } from '../../types/deviceTypes'
import { useDevices } from '../../contexts/DeviceContext'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'
import { useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { AxiosResponse } from 'axios'
import dayjs, { Dayjs } from 'dayjs'
import { API } from '../../utils'
import './Automation.scss'
import {
  CircularProgress,
  FormControlLabel,
  Autocomplete,
  RadioGroup,
  Typography,
  TextField,
  Button,
  Radio,
  Modal,
  Box,
} from '@mui/material'

const Automation = () => {
  const [automationEvents, setAutomationEvents] = useState<TAutomationEvent[]>()
  const [addModalIsOpen, setAddModalIsOpen] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [automations, setAutomations] = useState<TAutomation[]>([])
  const [selectedDevice, setSelectedDevice] = useState<TDevice>()
  const [newState, setNewState] = useState<TDeviceState[]>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { devices, devicesLoaded } = useDevices()

  // Fetch all automations
  useEffect(() => {
    setIsLoading(true)
    if (!devicesLoaded) return
    API.get('/automations/')
      .then((response: AxiosResponse) => {
        setAutomations(
          response.data.map((automation: TAutomation) => ({
            ...automation,
            dateTime: new Date(automation.dateTime),
          }))
        )
      })
      .catch(err => console.error('POST request failed', err))
  }, [devicesLoaded])

  // Format automation events for calendar
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

  // Event handlers
  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Display event modal to update/delete', clickInfo)
  }

  const handleAddModalOpen = (info?: any) => {
    setSelectedDate(dayjs(info && 'date' in info ? info.date : undefined))
    setAddModalIsOpen(true)
  }

  const handleAddModalClose = () => {
    setAddModalIsOpen(false)
    setSelectedDevice(undefined)
  }

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date)
  }

  const handleNewStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDevice) return
    setNewState([
      {
        datatype: selectedDevice.state[0].datatype,
        fieldName: selectedDevice.state[0].fieldName,
        value: getCurrentStateValue(e.target.value),
      },
    ])
  }

  const handleAddModalSubmit = () => {
    setIsLoading(true)
    const postData = {
      // Format date for backend (HTTP Standard RFC 1123),
      dateTime: selectedDate?.utc().format('YYYY-MM-DD HH:mm:ss'),
      deviceId: selectedDevice?.deviceId,
      newState: newState,
    }
    API.post('/automations/', postData, 'Create new automation request.\n')
      .then((res: AxiosResponse) => {
        setAutomations([
          ...automations,
          { ...res.data, dateTime: new Date(res.data.dateTime) },
        ])
        enqueueSnackbar('Successfully added automation', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
      .catch(err => console.error('POST request failed', err))
      .finally(() => {
        handleAddModalClose()
        setIsLoading(false)
      })
  }

  // Helper methods
  const getDeviceOptions = (): { id: number; label: string }[] => {
    return devices.map(device => ({
      label: `Device ${device.deviceId}: ${device.name}`,
      id: device.deviceId,
    }))
  }

  const getCurrentStateValue = (value: string): string | number | undefined => {
    if (!selectedDevice) return undefined
    switch (selectedDevice.state[0].datatype) {
      case 'string':
        return value
      case 'integer':
        return parseInt(value)
      case 'float':
        return parseFloat(value)
    }
  }

  return (
    <div className='automation'>
      <h2>Automations</h2>
      {isLoading && <CircularProgress size={100} className='loading' />}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        navLinks={true}
        allDaySlot={false}
        events={automationEvents}
        initialView={'dayGridMonth'}
        eventClick={handleEventClick}
        dateClick={info => handleAddModalOpen(info)}
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
            click: () => handleAddModalOpen(),
          },
        }}
      />

      {/* Add Automation Modal */}
      <Modal
        open={addModalIsOpen}
        onClose={handleAddModalClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box>
          <Typography id='modal-modal-title' fontWeight='bold' variant='h4'>
            Add Automation
          </Typography>
          <div
            className='modal-details-container'
            style={{ marginBlock: '15px 30px' }}
          >
            <Typography className='field-name'>
              Select date and time for automation:
            </Typography>
            <DateTimePicker
              format='DD-MM-YYYY  HH:mm A'
              onChange={handleDateChange}
              value={selectedDate}
            />
          </div>
          <Typography id='modal-modal-title' fontWeight='bold' variant='h6'>
            Input Device Details
          </Typography>
          <div className='modal-details-container'>
            <Typography className='field-name'>
              Please select a device:
            </Typography>
            <Autocomplete
              blurOnSelect
              autoHighlight
              options={getDeviceOptions()}
              getOptionDisabled={option => {
                const device = devices.find(
                  currDevice => currDevice.deviceId === option.id
                )
                if (!device) return true
                return !(device && Array.isArray(device.state))
              }}
              onChange={(_, newDevice) => {
                if (newDevice)
                  setSelectedDevice(
                    devices.find(d => d.deviceId == newDevice.id)
                  )
                else setSelectedDevice(undefined)
                console.log(selectedDevice)
              }}
              renderInput={params => (
                <TextField {...params} placeholder='Device...' />
              )}
            />
          </div>
          {selectedDevice && (
            <div>
              <div className='modal-table automation-info'>
                <strong>Description:</strong>
                {selectedDevice?.description}
                <strong>Location:</strong>
                {selectedDevice?.location}
              </div>
              <div className='modal-details-container'>
                <Typography className='input-field-name'>
                  Set device{' '}
                  <span style={{ fontWeight: 'bold' }}>
                    {selectedDevice.state[0].fieldName}{' '}
                  </span>
                  to:
                </Typography>
                {selectedDevice.state[0].datatype === 'boolean' ? (
                  // Todo - Boolean automation interface
                  <RadioGroup
                    aria-labelledby='radio-buttons-group-label'
                    name='radio-buttons-group'
                    defaultValue={true}
                  >
                    <FormControlLabel
                      control={<Radio />}
                      value={true}
                      label='On'
                    />
                    <FormControlLabel
                      control={<Radio />}
                      value={false}
                      label='Off'
                    />
                  </RadioGroup>
                ) : (
                  <TextField
                    placeholder={`Input ${selectedDevice.state[0].datatype}`}
                    onChange={handleNewStateChange}
                    size='small'
                    type={
                      selectedDevice.state[0].datatype === 'string'
                        ? 'text'
                        : 'number'
                    }
                  />
                )}
              </div>
            </div>
          )}
          <div className='actions'>
            <Button className='cancel-btn' onClick={handleAddModalClose}>
              <i className='bi bi-x-lg' />
              Cancel
            </Button>
            <Button className='submit-btn' onClick={handleAddModalSubmit}>
              <i className='bi bi-floppy' />
              Create
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default Automation
