import { TMUIAutocompleteOption } from '../../types/generalTypes'
import { useDevices } from '../../contexts/DeviceContext'
import { useApi } from '../../contexts/ApiContext'
import { AxiosResponse, AxiosError } from 'axios'
import { TDevice } from '../../types/deviceTypes'
import { enqueueSnackbar } from 'notistack'
import {
  Autocomplete,
  Typography,
  TextField,
  Button,
  Modal,
  Box,
} from '@mui/material'
import {
  useDeferredValue,
  SetStateAction,
  useEffect,
  Dispatch,
  useState,
} from 'react'

interface EditDeviceModalProps {
  showEdit: boolean
  selectedDevice: TDevice | null
  setShowEdit: Dispatch<SetStateAction<boolean>>
}

const EditDeviceModal = ({
  showEdit,
  selectedDevice,
  setShowEdit,
}: EditDeviceModalProps) => {
  const [locations, setLocations] = useState<TMUIAutocompleteOption[]>([])
  const [location, setLocation] = useState<TMUIAutocompleteOption>()
  const { devices, tags, devicesLoaded, setDevices } = useDevices()
  const [currentDevice, setCurrentDevice] = useState<TDevice>()
  const { API } = useApi()

  // useDeferredValue resolves intensive re-rendering issue
  useDeferredValue(currentDevice)

  useEffect(() => {
    setCurrentDevice(selectedDevice as TDevice)
  }, [selectedDevice, showEdit])

  // Load location tags
  useEffect(() => {
    const options = tags.map(tag => {
      if (tag.tagType == 'Room')
        return {
          id: tag.tagId,
          label: tag.name,
        }
    })
    setLocations(options ?? [])
  }, [devicesLoaded, currentDevice])

  useEffect(() => {
    const option = locations.find(
      location => location?.id === currentDevice?.roomTag
    )
    setLocation(option ?? null)
  }, [locations])

  const handleCloseEdit = () => {
    setCurrentDevice(undefined)
    setShowEdit(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDevice(prev => {
      if (!prev) return prev
      const updatedDevice = { ...prev, [e.target.name]: e.target.value }
      return updatedDevice
    })
  }

  // Handle update device call and data grid update
  const updateDevice = (updatedDevice?: TDevice) => {
    if (!updatedDevice) return undefined
    const { location, ...postData } = updatedDevice

    API.put(`/devices/${updatedDevice?.deviceId}/`, postData)
      .then((response: AxiosResponse) => {
        setDevices(
          devices.map(device =>
            device.deviceId === updatedDevice.deviceId
              ? { ...device, ...response.data }
              : device
          )
        )
        enqueueSnackbar('Successfully updated device', {
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
        if (currentDevice)
          setDevices(
            devices.map(device =>
              device.deviceId === currentDevice.deviceId
                ? currentDevice
                : device
            )
          )
        setShowEdit(false)
      })
  }

  return (
    <Modal open={showEdit} onClose={handleCloseEdit}>
      <Box>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
          Edit Device Details:
        </Typography>
        <div className='modal-table device-info'>
          <strong className='field-name'>Device ID:</strong>
          {selectedDevice?.deviceId}
          <strong className='field-name'>IP Address:</strong>
          {selectedDevice?.ipAddress}
          <strong className='input-field-name'>Name:</strong>
          <TextField
            size='small'
            name='name'
            value={currentDevice?.name ?? ''}
            onChange={handleChange}
          />
          <strong className='input-field-name'>Description:</strong>
          <TextField
            size='small'
            name='description'
            value={currentDevice?.description ?? ''}
            onChange={handleChange}
          />
          <strong className='input-field-name'>Location:</strong>
          <Autocomplete
            size='small'
            blurOnSelect
            autoHighlight
            value={location}
            options={locations}
            onChange={(_, location) => {
              setLocation(location)
              if (currentDevice)
                setCurrentDevice({
                  ...currentDevice,
                  location: location?.label,
                  roomTag: location?.id,
                })
            }}
            renderInput={params => (
              <TextField {...params} placeholder='Location...' />
            )}
          />
        </div>
        <div className='actions'>
          <Button className='cancel-btn' onClick={handleCloseEdit}>
            <i className='bi bi-x-lg' />
            Cancel
          </Button>
          <Button
            className='update-btn'
            onClick={() => updateDevice(currentDevice)}
          >
            <i className='bi bi-floppy' />
            Save
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

export default EditDeviceModal
