import { Modal, Box, Typography, Button } from '@mui/material'
import { useDevices } from '../../contexts/DeviceContext'
import { useApi } from '../../contexts/ApiContext'
import { TDevice } from '../../types/deviceTypes'
import { Dispatch, SetStateAction } from 'react'
import { enqueueSnackbar } from 'notistack'
import { Navigate, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { getLinkTopLevel } from '../../utils'

interface DeleteDeviceModalProps {
  showDelete: boolean
  selectedDevice: TDevice | null
  setDeleteIsClosed: () => void
  setSelectedDevice: Dispatch<SetStateAction<TDevice | null>>
}

const DeleteDeviceModal = ({
  showDelete,
  selectedDevice,
  setDeleteIsClosed,
  setSelectedDevice,
}: DeleteDeviceModalProps) => {
  const { devices, setDevices } = useDevices()
  const navigate = useNavigate()
  const { API } = useApi()

  const deleteDevice = (deviceId?: number) => {
    API.delete(`/devices/${deviceId}/`)
      .then((response: any) => {
        if (response.status == 200) {
          if (window.location.pathname.includes(String(deviceId))) {
            navigate(`${getLinkTopLevel()}/devices`)
          }
          setSelectedDevice(null)
          setDevices(devices?.filter(device => device.deviceId != deviceId))
          enqueueSnackbar('Successfully deleted device', {
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
        setDeleteIsClosed()
      })
  }

  return (
    <Modal open={showDelete} onClose={setDeleteIsClosed}>
      <Box>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
          Delete Device from System:
        </Typography>
        <div className='modal-table device-info'>
          <strong>Device ID:</strong> {selectedDevice?.deviceId}
          <strong>Name:</strong> {selectedDevice?.name}
          <strong>Description:</strong> {selectedDevice?.description}
          <strong>IP Address:</strong> {selectedDevice?.ipAddress}
          <strong>Location:</strong> {selectedDevice?.location}
        </div>
        <Typography id='modal-description' sx={{ mt: 2 }}>
          Are you sure you want to delete this device from the system? Once it
          has been removed, it will needed to be reconnected again.
        </Typography>
        <div className='actions'>
          <Button className='cancel-btn' onClick={setDeleteIsClosed}>
            <i className='bi bi-x-lg' />
            Cancel
          </Button>
          <Button
            className='delete-btn'
            onClick={() => deleteDevice(selectedDevice?.deviceId)}
          >
            <i className='bi bi-trash' />
            Delete
          </Button>
        </div>
      </Box>
    </Modal>
  )
}

export default DeleteDeviceModal
