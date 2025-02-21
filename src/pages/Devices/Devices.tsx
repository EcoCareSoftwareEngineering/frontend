import { useDevices } from '../../contexts/DeviceContext'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useDeferredValue, useState } from 'react'
import { API, getCSSVariable } from '../../utils'
import { TDevice } from '../../types/deviceTypes'
import { enqueueSnackbar } from 'notistack'
import { Link } from 'react-router-dom'
import {
  useMediaQuery,
  Typography,
  TextField,
  Tooltip,
  Button,
  Modal,
  Box,
} from '@mui/material'
import './Devices.scss'

const Devices = () => {
  const [selectedDevice, setSelectedDevice] = useState<TDevice | null>(null)
  const [currentDevice, setCurrentDevice] = useState<TDevice>()
  const [isLoading, setIsLoading] = useState<Boolean>(false)
  const [isEdited, setIsEdited] = useState<Boolean>(false)
  const { devices, setDevices } = useDevices()

  const offColor = getCSSVariable('--off-color')
  const onColor = getCSSVariable('--on-color')

  // useDeferredValue resolves intensive re-rendering issue
  useDeferredValue(currentDevice)

  const [showDelete, setShowDelete] = useState<boolean>(false)
  const setDeleteIsClosed = () => setShowDelete(false)
  const handleClickDelete = (row: TDevice) => {
    setSelectedDevice(row)
    setShowDelete(true)
  }

  // Handle device deletion call and data grid update
  const deleteDevice = (deviceId?: number) => {
    setIsLoading(true)
    API.delete(`/devices/${deviceId}/`)
      .then((response: any) => {
        if (response.status == 200) {
          setSelectedDevice(null)
          setDevices(devices?.filter(device => device.deviceId != deviceId))
          setDeleteIsClosed()
        }
      })
      .catch((err: any) => {
        enqueueSnackbar(err.message ?? 'Error deleting device', {
          variant: 'error',
          preventDuplicate: true,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
    setIsLoading(false)
  }

  const [showEdit, setShowEdit] = useState<boolean>(false)
  const setEditIsClosed = () => setShowEdit(false)
  const handleClickEdit = (row: TDevice) => {
    setSelectedDevice(row)
    setCurrentDevice(row)
    setShowEdit(true)
  }

  // Handle update device call and data grid update
  const updateDevice = (updatedDevice?: TDevice) => {
    API.put(`/devices/${updatedDevice?.deviceId}/`, updatedDevice)
      .then((response: any) => {
        if (response.status == 200) {
        }
      })
      .catch((err: any) => {
        enqueueSnackbar(err.message ?? 'Error updating device', {
          variant: 'error',
          preventDuplicate: true,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDevice(prev => {
      if (!prev) return prev
      const updatedDevice = { ...prev, [e.target.name]: e.target.value }

      if (selectedDevice) {
        const hasChanges = ['name', 'description', 'location'].some(
          field =>
            updatedDevice[field as keyof TDevice] !==
            selectedDevice[field as keyof TDevice]
        )
        if (hasChanges !== isEdited) setIsEdited(hasChanges)
      } else if (!isEdited) setIsEdited(true)

      return updatedDevice
    })
  }

  const columns: GridColDef[] = [
    {
      field: 'deviceId',
      headerName: 'ID',
      width: 70,
      renderCell: (params: any) => (
        <Link
          className='device-nav'
          style={{ paddingLeft: '5px' }}
          state={{ device: params.row }}
          to={`/devices/${params.value}`}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'name',
      headerName: 'Device',
      minWidth: 150,
      flex: 8,
      renderCell: (params: any) => (
        <Link
          className='device-nav'
          state={{ device: params.row }}
          to={`/devices/${params.row.deviceId}`}
        >
          {params.value}
        </Link>
      ),
    },
    { field: 'location', headerName: 'Location', minWidth: 150, flex: 8 },
    {
      field: 'status',
      headerName: 'Power',
      flex: 5,
      minWidth: 70,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <div className='status-cell power-cell'>
          <div
            className='power value'
            style={{
              backgroundColor: params.value == 'On' ? onColor : offColor,
            }}
          >
            {params.value}
          </div>
        </div>
      ),
    },
    {
      field: 'faultStatus',
      headerName: 'Fault',
      flex: 7,
      minWidth: 70,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <div className='status-cell fault-cell'>
          <div
            className='fault value'
            style={{
              backgroundColor: params.value == 'Ok' ? onColor : offColor,
            }}
          >
            {params.value}
          </div>
        </div>
      ),
    },
    !useMediaQuery('(max-width:1000px)') && {
      field: 'description',
      headerName: 'Description',
      flex: 20,
      minWidth: 250,
    },
    {
      field: 'deviceActions',
      headerName: 'Actions',
      resizable: false,
      width: 100,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => {
        return (
          <div className='actions'>
            <Tooltip title='Edit device'>
              <Button onClick={() => handleClickEdit(params.row)}>
                <i className='bi bi-pencil' />
              </Button>
            </Tooltip>
            <Modal
              open={showEdit}
              onClose={setEditIsClosed}
              aria-labelledby='modal-modal-title'
              aria-describedby='modal-modal-description'
            >
              <Box>
                <Typography
                  id='modal-modal-title'
                  fontWeight='bold'
                  variant='h5'
                >
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
                    defaultValue={currentDevice?.name}
                    onChange={handleChange}
                  />
                  <strong className='input-field-name'>Description:</strong>
                  <TextField
                    size='small'
                    name='description'
                    value={currentDevice?.description}
                    onChange={handleChange}
                  />
                  <strong className='input-field-name'>Location:</strong>
                  <TextField
                    size='small'
                    name='location'
                    value={currentDevice?.location}
                    onChange={handleChange}
                  />
                </div>
                <div className='actions'>
                  <Button className='cancel-btn' onClick={setEditIsClosed}>
                    <i className='bi bi-x-lg' />
                    Cancel
                  </Button>
                  <Button
                    disabled={!isEdited}
                    className={`update-btn ${isEdited ?? 'disabled'}`}
                    onClick={() => updateDevice(currentDevice)}
                  >
                    <i className='bi bi-floppy' />
                    Save
                  </Button>
                </div>
              </Box>
            </Modal>
            <Tooltip title='Delete device'>
              <Button onClick={() => handleClickDelete(params.row)}>
                <i className='bi bi-trash' />
              </Button>
            </Tooltip>
            <Modal
              open={showDelete}
              onClose={setDeleteIsClosed}
              aria-labelledby='modal-modal-title'
              aria-describedby='modal-modal-description'
            >
              <Box>
                <Typography
                  id='modal-modal-title'
                  fontWeight='bold'
                  variant='h5'
                >
                  Remove Device from System:
                </Typography>
                <div className='modal-table device-info'>
                  <strong>Device ID:</strong> {selectedDevice?.deviceId}
                  <strong>Name:</strong> {selectedDevice?.name}
                  <strong>Description:</strong> {selectedDevice?.description}
                  <strong>IP Address:</strong> {selectedDevice?.ipAddress}
                  <strong>Location:</strong> {selectedDevice?.location}
                </div>
                <Typography id='modal-description' sx={{ mt: 2 }}>
                  Are you sure you want to delete this device from the system?
                  Once it was been removed, it will needed to be reconnected
                  again.
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
          </div>
        )
      },
    },
  ].filter(Boolean) as GridColDef[]

  return (
    <div className='devices'>
      {devices && devices.length > 0 && (
        <DataGrid
          rows={devices}
          columns={columns}
          paginationMode='server'
          rowCount={devices.length}
          getRowId={row => row.deviceId}
          disableRowSelectionOnClick
          disableColumnResize
        />
      )}
    </div>
  )
}

export default Devices
