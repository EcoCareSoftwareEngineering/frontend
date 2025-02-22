import { EventClickArg, EventContentArg } from '@fullcalendar/core/index.js'
import { TAutomation, TAutomationEvent } from '../../types/automationTypes'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { TDevice, TDeviceState } from '../../types/deviceTypes'
import { useDevices } from '../../contexts/DeviceContext'
import interactionPlugin from '@fullcalendar/interaction'
import { EventImpl } from '@fullcalendar/core/internal'
import timeGridPlugin from '@fullcalendar/timegrid'
import { SetState } from '../../types/generalTypes'
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

const getDeviceOptions = (
  devices: TDevice[]
): { id: number; label: string }[] => {
  return devices.map(device => ({
    label: `Device ${device.deviceId}: ${device.name}`,
    id: device.deviceId,
  }))
}

const Automation = () => {
  const [automationEvents, setAutomationEvents] = useState<TAutomationEvent[]>()
  const [selectedAutomation, setSelectedAutomation] = useState<TAutomation>()
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [automations, setAutomations] = useState<TAutomation[]>([])
  const [selectedDevice, setSelectedDevice] = useState<TDevice>()
  const [selectedEvent, setSelectedEvent] = useState<EventImpl>()
  const [newState, setNewState] = useState<TDeviceState[]>()
  const { devices, devicesLoaded } = useDevices()

  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState<boolean>(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false)
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [addModalIsOpen, setAddModalIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

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
  const handleAddModalOpen = (info?: any) => {
    setSelectedDate(dayjs(info && 'date' in info ? info.date : undefined))
    setAddModalIsOpen(true)
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

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedDevice(clickInfo.event.extendedProps.device)
    setSelectedEvent(clickInfo.event)
    setSelectedAutomation(
      automations.find(a => a.automationId === parseInt(clickInfo.event.id))
    )
    setDetailsModalIsOpen(true)
  }

  const handleDetailsModalClose = () => {
    setDetailsModalIsOpen(false)
    setSelectedDevice(undefined)
  }

  const getCurrentStateValue = (value: string): string | number | undefined => {
    if (!selectedDevice) return undefined
    switch (selectedDevice.state[0].datatype) {
      case 'string':
        return value
      case 'boolean':
        return 'idk' // Todo fix this
      default:
        return parseInt(value)
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

      <AddAutomationModal
        devices={devices}
        newState={newState}
        setIsLoading={setIsLoading}
        automations={automations}
        setAutomations={setAutomations}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        addModalIsOpen={addModalIsOpen}
        setAddModalIsOpen={setAddModalIsOpen}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        handleNewStateChange={handleNewStateChange}
      />
      <UpdateAutomationModal
        devices={devices}
        newState={newState}
        setIsLoading={setIsLoading}
        automations={automations}
        setAutomations={setAutomations}
        selectedAutomation={selectedAutomation}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        updateModalIsOpen={updateModalIsOpen}
        selectedDevice={selectedDevice}
        setUpdateModalIsOpen={setUpdateModalIsOpen}
        setSelectedDevice={setSelectedDevice}
        handleNewStateChange={handleNewStateChange}
      />
      <AutomationDetailsModal
        selectedEvent={selectedEvent}
        selectedDevice={selectedDevice}
        setSelectedDate={setSelectedDate}
        detailsModalIsOpen={detailsModalIsOpen}
        selectedAutomation={selectedAutomation}
        setUpdateModalIsOpen={setUpdateModalIsOpen}
        setDeleteModalIsOpen={setDeleteModalIsOpen}
        setDetailsModalIsOpen={setDetailsModalIsOpen}
        handleDetailsModalClose={handleDetailsModalClose}
      />
      <DeleteAutomationModal
        automations={automations}
        setIsLoading={setIsLoading}
        selectedEvent={selectedEvent}
        selectedDevice={selectedDevice}
        setAutomations={setAutomations}
        selectedAutomation={selectedAutomation}
        deleteModalIsOpen={deleteModalIsOpen}
        setDeleteModalIsOpen={setDeleteModalIsOpen}
      />
    </div>
  )
}

const AddAutomationModal = ({
  devices,
  newState,
  setIsLoading,
  automations,
  setAutomations,
  selectedDate,
  setSelectedDate,
  addModalIsOpen,
  setAddModalIsOpen,
  selectedDevice,
  setSelectedDevice,
  handleNewStateChange,
}: {
  devices: TDevice[]
  newState: TDeviceState[] | undefined
  setIsLoading: SetState<boolean>
  automations: TAutomation[]
  setAutomations: SetState<TAutomation[]>
  selectedDate: Dayjs | null
  setSelectedDate: SetState<Dayjs | null>
  addModalIsOpen: boolean
  setAddModalIsOpen: SetState<boolean>
  selectedDevice: TDevice | undefined
  setSelectedDevice: SetState<TDevice | undefined>
  handleNewStateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const handleAddModalClose = () => {
    setAddModalIsOpen(false)
    setSelectedDevice(undefined)
  }

  const handleAddModalSubmit = () => {
    setIsLoading(true)
    const postData = {
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

  return (
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
        <EditAutomationBox
          devices={devices}
          selectedDate={selectedDate}
          selectedDevice={selectedDevice}
          setSelectedDate={setSelectedDate}
          setSelectedDevice={setSelectedDevice}
          handleNewStateChange={handleNewStateChange}
        />
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
  )
}

const UpdateAutomationModal = ({
  devices,
  newState,
  setIsLoading,
  automations,
  setAutomations,
  selectedDate,
  setSelectedDate,
  updateModalIsOpen,
  setUpdateModalIsOpen,
  selectedAutomation,
  selectedDevice,
  setSelectedDevice,
  handleNewStateChange,
}: {
  devices: TDevice[]
  newState: TDeviceState[] | undefined
  setIsLoading: SetState<boolean>
  automations: TAutomation[]
  selectedAutomation: TAutomation | undefined
  setAutomations: SetState<TAutomation[]>
  selectedDate: Dayjs | null
  setSelectedDate: SetState<Dayjs | null>
  updateModalIsOpen: boolean
  setUpdateModalIsOpen: SetState<boolean>
  selectedDevice: TDevice | undefined
  setSelectedDevice: SetState<TDevice | undefined>
  handleNewStateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const handleUpdateModalClose = () => {
    setUpdateModalIsOpen(false)
    setSelectedDevice(undefined)
  }

  const handleUpdateModalSubmit = () => {
    setIsLoading(true)
    const putData = {
      dateTime: selectedDate?.utc().format('YYYY-MM-DD HH:mm:ss'),
      newState: newState,
    }
    API.put(
      `/automations/${selectedAutomation?.automationId}/`,
      putData,
      'Update an automation request.\n'
    )
      .then((res: AxiosResponse) => {
        setAutomations([
          ...automations,
          { ...res.data, dateTime: new Date(res.data.dateTime) },
        ])
        enqueueSnackbar('Successfully updated automation', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
      .catch(err => console.error('PUT request failed', err))
      .finally(() => {
        handleUpdateModalClose()
        setIsLoading(false)
      })
  }

  return (
    <Modal
      open={updateModalIsOpen}
      onClose={handleUpdateModalClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h4'>
          Edit Automation
        </Typography>
        <EditAutomationBox
          devices={devices}
          selectedDate={selectedDate}
          selectedDevice={selectedDevice}
          selectedAutomation={selectedAutomation}
          setSelectedDate={setSelectedDate}
          setSelectedDevice={setSelectedDevice}
          handleNewStateChange={handleNewStateChange}
        />
        <div className='actions'>
          <Button className='cancel-btn' onClick={handleUpdateModalClose}>
            <i className='bi bi-x-lg' />
            Cancel
          </Button>
          <Button className='submit-btn' onClick={handleUpdateModalSubmit}>
            <i className='bi bi-floppy' />
            Create
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

const EditAutomationBox = ({
  devices,
  selectedDate,
  selectedDevice,
  setSelectedDate,
  setSelectedDevice,
  handleNewStateChange,
  selectedAutomation,
}: {
  devices: TDevice[]
  selectedDate: Dayjs | null
  selectedAutomation?: TAutomation
  selectedDevice: TDevice | undefined
  setSelectedDate: SetState<Dayjs | null>
  setSelectedDevice: SetState<TDevice | undefined>
  handleNewStateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <>
      <div
        className='modal-details-container'
        style={{ marginBlock: '15px 30px' }}
      >
        <Typography className='field-name'>
          Select date and time for automation:
        </Typography>
        <DateTimePicker
          format='DD-MM-YYYY  HH:mm A'
          onChange={date => setSelectedDate(date)}
          value={selectedDate}
        />
      </div>
      <Typography id='modal-modal-title' fontWeight='bold' variant='h6'>
        Input Device Details
      </Typography>
      <div className='modal-details-container'>
        <Typography className='field-name'>Please select a device:</Typography>
        <Autocomplete
          blurOnSelect
          autoHighlight
          options={getDeviceOptions(devices)}
          getOptionDisabled={option => {
            const device = devices.find(
              currDevice => currDevice.deviceId === option.id
            )
            if (!device) return true
            return !(device && Array.isArray(device.state))
          }}
          defaultValue={selectedDevice && getDeviceOptions([selectedDevice])[0]}
          onChange={(_, newDevice) => {
            if (newDevice)
              setSelectedDevice(devices.find(d => d.deviceId == newDevice.id))
            else setSelectedDevice(undefined)
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
                <FormControlLabel control={<Radio />} value={true} label='On' />
                <FormControlLabel
                  control={<Radio />}
                  value={false}
                  label='Off'
                />
              </RadioGroup>
            ) : (
              <TextField
                placeholder={`Input ${selectedDevice.state[0].datatype}`}
                defaultValue={
                  selectedAutomation && selectedAutomation.newState[0].value
                }
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
    </>
  )
}

const AutomationDetailsModal = ({
  selectedEvent,
  selectedDevice,
  setSelectedDate,
  detailsModalIsOpen,
  selectedAutomation,
  setUpdateModalIsOpen,
  setDeleteModalIsOpen,
  setDetailsModalIsOpen,
  handleDetailsModalClose,
}: {
  detailsModalIsOpen: boolean
  handleDetailsModalClose: () => void
  setSelectedDate: SetState<Dayjs | null>
  setUpdateModalIsOpen: SetState<boolean>
  setDeleteModalIsOpen: SetState<boolean>
  setDetailsModalIsOpen: SetState<boolean>
  selectedAutomation?: TAutomation
  selectedDevice?: TDevice
  selectedEvent?: EventImpl
}) => {
  const handleEditModalOpen = () => {
    setSelectedDate(dayjs(selectedAutomation?.dateTime))
    setUpdateModalIsOpen(true)
    setDetailsModalIsOpen(false)
  }

  const handleDeleteModalOpen = () => {
    setDeleteModalIsOpen(true)
    setDetailsModalIsOpen(false)
  }

  return (
    <Modal
      open={detailsModalIsOpen}
      onClose={handleDetailsModalClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
          Automation Event Details
        </Typography>
        <div className='modal-table device-info'>
          <strong>Automation ID:</strong> {selectedEvent?.id}
          <strong>Device Name:</strong> {selectedDevice?.name}
          <strong>Device Info:</strong> {selectedDevice?.description}
          <strong>Location:</strong> {selectedDevice?.location}
          <strong>Action:</strong>
          {`Set ${selectedAutomation?.newState[0].fieldName} to ${selectedAutomation?.newState[0].value}`}
        </div>
        <div className='event-actions actions'>
          <Button className='cancel-btn' onClick={handleDetailsModalClose}>
            <i className='bi bi-x-lg' />
            Cancel
          </Button>
          <Button className='update-btn' onClick={handleEditModalOpen}>
            <i className='bi bi-pencil' />
            Edit
          </Button>
          <Button className='delete-btn' onClick={handleDeleteModalOpen}>
            <i className='bi bi-trash' />
            Delete
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

const DeleteAutomationModal = ({
  automations,
  setIsLoading,
  selectedEvent,
  setAutomations,
  selectedDevice,
  deleteModalIsOpen,
  selectedAutomation,
  setDeleteModalIsOpen,
}: {
  automations: TAutomation[]
  deleteModalIsOpen: boolean
  setIsLoading: SetState<boolean>
  selectedDevice: TDevice | undefined
  selectedEvent: EventImpl | undefined
  setAutomations: SetState<TAutomation[]>
  selectedAutomation: TAutomation | undefined
  setDeleteModalIsOpen: SetState<boolean>
}) => {
  const handleDeleteAutomation = (automationId?: number) => {
    setIsLoading(true)
    API.delete(`/automations/${automationId}/`, 'Delete an automation request')
      .then((response: AxiosResponse) => {
        if (response.status == 200) {
          setAutomations(
            automations?.filter(a => a.automationId !== automationId)
          )
          enqueueSnackbar('Successfully deleted automation', {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          })
        }
      })
      .catch(err => console.error('DELETE request failed', err))
      .finally(() => {
        setIsLoading(true)
        setDeleteModalIsOpen(false)
      })
  }

  return (
    <Modal
      open={deleteModalIsOpen}
      onClose={() => setDeleteModalIsOpen(false)}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h6'>
          Delete Automation from System?
        </Typography>
        <div className='modal-table device-info'>
          <strong>Automation ID:</strong> {selectedEvent?.id}
          <strong>Device Name:</strong> {selectedDevice?.name}
          <strong>Device Info:</strong> {selectedDevice?.description}
          <strong>Location:</strong> {selectedDevice?.location}
          <strong>Action:</strong>
          {`Set ${selectedAutomation?.newState[0].fieldName} to ${selectedAutomation?.newState[0].value}`}
        </div>
        <Typography id='modal-description' sx={{ mt: 2 }}>
          Are you sure you want to delete this automation from the system? Once
          it has been removed, it will needed to be created again.
        </Typography>
        <div className='event-actions actions'>
          <Button
            className='cancel-btn'
            onClick={() => setDeleteModalIsOpen(false)}
          >
            <i className='bi bi-x-lg' />
            Cancel
          </Button>
          <Button
            className='delete-btn'
            onClick={() =>
              handleDeleteAutomation(selectedAutomation?.automationId)
            }
          >
            <i className='bi bi-trash' />
            Delete
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

export default Automation
