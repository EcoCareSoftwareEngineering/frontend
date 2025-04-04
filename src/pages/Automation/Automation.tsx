import { TAutomation, TAutomationEvent } from '../../types/automationTypes'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { TMUIAutocompleteOption } from '../../types/generalTypes'
import { TDevice, TDeviceState } from '../../types/deviceTypes'
import { useDevices } from '../../contexts/DeviceContext'
import { ChangeEvent, useEffect, useState } from 'react'
import * as generalTypes from '../../types/generalTypes'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { enqueueSnackbar } from 'notistack'
import dayjs, { Dayjs } from 'dayjs'
import './Automation.scss'

// FullCalendar package imports
import { EventClickArg, EventContentArg } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import { EventImpl } from '@fullcalendar/core/internal'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'

// Material UI package imports
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import {
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

const getDeviceOptions = (devices: TDevice[]): TMUIAutocompleteOption[] => {
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
  const [newState, setNewState] = useState<TDeviceState[]>([])
  const { devices, devicesLoaded } = useDevices()
  const { API, loading } = useApi()

  // Modal action states
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState<boolean>(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false)
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState<boolean>(false)
  const [addModalIsOpen, setAddModalIsOpen] = useState<boolean>(false)

  // Fetch all automations
  useEffect(() => {
    if (!devicesLoaded) return
    API.get('/automations/', 'Fetch all automations request')
      .then((response: AxiosResponse) => {
        setAutomations(
          response.data.map((automation: TAutomation) => ({
            ...automation,
            dateTime: new Date(automation.dateTime),
          }))
        )
      })
      .catch((err: AxiosError | any) => {
        console.error('GET request failed', err)
      })
  }, [devicesLoaded])

  useEffect(() => {
    setNewState(selectedAutomation?.newState ?? [])
  }, [addModalIsOpen, updateModalIsOpen])

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
    }
  }, [automations])

  // Event handlers
  const handleAddModalOpen = (info?: any) => {
    setSelectedDate(dayjs(info && 'date' in info ? info.date : undefined))
    setAddModalIsOpen(true)
  }

  const handleNewStateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    if (!selectedDevice) return
    setNewState(
      newState?.some(s => s.fieldName == fieldName)
        ? newState.map(state =>
            state.fieldName == fieldName
              ? {
                  ...state,
                  value: getCurrentStateValue(e.target.value),
                }
              : state
          )
        : [
            ...(newState as TDeviceState[]),
            {
              fieldName: fieldName,
              datatype: selectedDevice.state.find(s => s.fieldName == fieldName)
                ?.datatype as 'integer' | 'float' | 'string' | 'boolean',
              value: getCurrentStateValue(e.target.value),
            },
          ]
    )
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
    <div className='automation page-content'>
      <div className='page-header'>
        <h2 className='page-title'>Automations</h2>
        <Button variant='contained' onClick={handleAddModalOpen}>
          <i className='bi bi-plus-lg' />
          Add Automation
        </Button>
      </div>
      <LoadingModal open={loading} />
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
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />

      <AddAutomationModal
        devices={devices}
        newState={newState}
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
  automations: TAutomation[]
  setAutomations: generalTypes.SetState<TAutomation[]>
  selectedDate: Dayjs | null
  setSelectedDate: generalTypes.SetState<Dayjs | null>
  addModalIsOpen: boolean
  setAddModalIsOpen: generalTypes.SetState<boolean>
  selectedDevice: TDevice | undefined
  setSelectedDevice: generalTypes.SetState<TDevice | undefined>
  handleNewStateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void
}) => {
  const { API } = useApi()

  const handleAddModalClose = () => {
    setAddModalIsOpen(false)
    setSelectedDevice(undefined)
  }

  const handleAddModalSubmit = () => {
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
            vertical: 'bottom',
            horizontal: 'center',
          },
        })
      })
      .catch((err: AxiosError | any) => {
        console.error('POST request failed', err)
      })
      .finally(() => {
        handleAddModalClose()
      })
  }

  return (
    <Modal open={addModalIsOpen} onClose={handleAddModalClose}>
      <Box>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h4'>
          Add Automation
        </Typography>
        <EditAutomationBox
          adding={true}
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
  automations: TAutomation[]
  selectedAutomation: TAutomation | undefined
  setAutomations: generalTypes.SetState<TAutomation[]>
  selectedDate: Dayjs | null
  setSelectedDate: generalTypes.SetState<Dayjs | null>
  updateModalIsOpen: boolean
  setUpdateModalIsOpen: generalTypes.SetState<boolean>
  selectedDevice: TDevice | undefined
  setSelectedDevice: generalTypes.SetState<TDevice | undefined>
  handleNewStateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void
}) => {
  const { API } = useApi()
  console.log(newState)

  const handleUpdateModalClose = () => {
    setUpdateModalIsOpen(false)
    setSelectedDevice(undefined)
  }

  const handleUpdateModalSubmit = () => {
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
        setAutomations(
          automations.map((automation: TAutomation) =>
            automation.automationId == res.data.automationId
              ? {
                  ...res.data,
                  dateTime: new Date(res.data.dateTime),
                  newState: res.data.newState,
                }
              : automation
          )
        )

        enqueueSnackbar('Successfully updated automation', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        })
      })
      .catch((err: AxiosError | any) => {
        console.error('PUT request failed', err)
      })
      .finally(() => {
        handleUpdateModalClose()
      })
  }

  return (
    <Modal open={updateModalIsOpen} onClose={handleUpdateModalClose}>
      <Box>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h4'>
          Edit Automation
        </Typography>
        <EditAutomationBox
          adding={false}
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
          <Button className='update-btn' onClick={handleUpdateModalSubmit}>
            <i className='bi bi-floppy' />
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

const EditAutomationBox = ({
  adding,
  devices,
  selectedDate,
  selectedDevice,
  setSelectedDate,
  setSelectedDevice,
  selectedAutomation,
  handleNewStateChange,
}: {
  adding: boolean
  devices: TDevice[]
  selectedDate: Dayjs | null
  selectedAutomation?: TAutomation
  selectedDevice: TDevice | undefined
  setSelectedDate: generalTypes.SetState<Dayjs | null>
  setSelectedDevice: generalTypes.SetState<TDevice | undefined>
  handleNewStateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => void
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
        {adding ? 'Input' : 'Selected'} Device Details
      </Typography>
      <div className='modal-details-container'>
        {adding && (
          <Typography className='field-name'>
            Please select a device:
          </Typography>
        )}
        <Autocomplete
          readOnly={!adding}
          blurOnSelect
          autoHighlight
          options={getDeviceOptions(devices)}
          getOptionDisabled={option => {
            const device = devices.find(
              currDevice => currDevice.deviceId === option?.id
            )
            if (!device) return true
            return !(
              device &&
              Array.isArray(device.state) &&
              device.state.length > 0
            )
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
          sx={{
            '& .MuiAutocomplete-popupIndicator': {
              display: `${adding ? 'inline-flex' : 'none'}`,
            },
          }}
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
          <div className='state-table'>
            {selectedDevice.state.map((d, index) => (
              <div key={d.fieldName}>
                <strong className='input-field-name'>
                  Set device {d.fieldName} to:
                </strong>
                {d.datatype === 'boolean' ? (
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
                    placeholder={`Input ${d.datatype}`}
                    defaultValue={
                      selectedAutomation?.newState.find(
                        state => state.fieldName === d.fieldName
                      )?.value
                    }
                    onChange={e =>
                      handleNewStateChange(
                        e as ChangeEvent<HTMLInputElement>,
                        d.fieldName
                      )
                    }
                    size='small'
                    type={d.datatype === 'string' ? 'text' : 'number'}
                  />
                )}
              </div>
            ))}
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
  setSelectedDate: generalTypes.SetState<Dayjs | null>
  setUpdateModalIsOpen: generalTypes.SetState<boolean>
  setDeleteModalIsOpen: generalTypes.SetState<boolean>
  setDetailsModalIsOpen: generalTypes.SetState<boolean>
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
    <Modal open={detailsModalIsOpen} onClose={handleDetailsModalClose}>
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
  selectedEvent,
  setAutomations,
  selectedDevice,
  deleteModalIsOpen,
  selectedAutomation,
  setDeleteModalIsOpen,
}: {
  automations: TAutomation[]
  deleteModalIsOpen: boolean
  selectedDevice: TDevice | undefined
  selectedEvent: EventImpl | undefined
  setAutomations: generalTypes.SetState<TAutomation[]>
  selectedAutomation: TAutomation | undefined
  setDeleteModalIsOpen: generalTypes.SetState<boolean>
}) => {
  const { API } = useApi()

  const handleDeleteAutomation = (automationId?: number) => {
    API.delete(`/automations/${automationId}/`, 'Delete an automation request')
      .then((response: AxiosResponse) => {
        if (response.status == 200) {
          setAutomations(
            automations?.filter(a => a.automationId !== automationId)
          )
          enqueueSnackbar('Successfully deleted automation', {
            variant: 'success',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center',
            },
          })
        }
      })
      .catch((err: AxiosError | any) => {
        console.error('DELETE request failed', err)
      })
      .finally(() => {
        setDeleteModalIsOpen(false)
      })
  }

  return (
    <Modal open={deleteModalIsOpen} onClose={() => setDeleteModalIsOpen(false)}>
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
