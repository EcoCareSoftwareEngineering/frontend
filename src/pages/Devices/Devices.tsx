import { TMUIAutocompleteOption } from '../../types/generalTypes'
import { useDeferredValue, useEffect, useState } from 'react'
import { useDevices } from '../../contexts/DeviceContext'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { API, getCSSVariable } from '../../utils'
import { TDevice } from '../../types/deviceTypes'
import { enqueueSnackbar } from 'notistack'
import { Link } from 'react-router-dom'
import { AxiosResponse } from 'axios'
import './Devices.scss'
import {
  useMediaQuery,
  Autocomplete,
  Typography,
  TextField,
  Tooltip,
  Button,
  Modal,
  Box,
} from '@mui/material'
import LoadingModal from '../../components/LoadingModal/LoadingModal'

const Devices = () => {
  const [selectedDevice, setSelectedDevice] = useState<TDevice | null>(null)
  const { tags, devices, devicesLoaded, setDevices } = useDevices()
  const [currentDevice, setCurrentDevice] = useState<TDevice>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEdited, setIsEdited] = useState<boolean>(false)

  const offColor = getCSSVariable('--off-color')
  const onColor = getCSSVariable('--on-color')

  // useDeferredValue resolves intensive re-rendering issue
  useDeferredValue(currentDevice)

  const [locations, setLocations] = useState<TMUIAutocompleteOption[]>([])
  const [location, setLocation] = useState<TMUIAutocompleteOption>()

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
  }, [devicesLoaded])

  // Set default location
  useEffect(() => {
    const option = locations.find(
      location => location?.id === currentDevice?.roomTag
    )
    setLocation(option ?? null)
  }, [selectedDevice])

  // DELETE device handlers
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
          enqueueSnackbar('Successfully deleted device', {
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          })
          setDeleteIsClosed()
        }
      })
      .catch(err => console.error('DELETE request failed', err))
      .finally(() => {
        setIsLoading(false)
      })
  }

  // UPDATE device handlers
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const setEditIsClosed = () => {
    setCurrentDevice(undefined)
    setShowEdit(false)
  }
  const handleClickEdit = (row: TDevice) => {
    setSelectedDevice(row)
    setCurrentDevice(row)
    setShowEdit(true)
  }

  // Handle update device call and data grid update
  const updateDevice = (updatedDevice?: TDevice) => {
    if (!updatedDevice) return undefined
    setIsLoading(true)
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
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
      .catch(err => console.error('POST request failed', err))
      .finally(() => {
        if (currentDevice)
          setDevices(
            devices.map(device =>
              device.deviceId === currentDevice.deviceId
                ? currentDevice
                : device
            )
          )
        setIsLoading(false)
        setShowEdit(false)
        setIsEdited(false)
      })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDevice(prev => {
      if (!prev) return prev
      const updatedDevice = { ...prev, [e.target.name]: e.target.value }

      if (selectedDevice) {
        const hasChanges = ['name', 'description'].some(
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
                      setIsEdited(
                        selectedDevice?.roomTag !== location?.id ? true : false
                      )
                    }}
                    renderInput={params => (
                      <TextField {...params} placeholder='Location...' />
                    )}
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
                  Once it has been removed, it will needed to be reconnected
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
    <div className='devices page-content'>
      <LoadingModal open={!devicesLoaded || isLoading} />
      <DataGrid
        rows={devices}
        columns={columns}
        paginationMode='server'
        rowCount={devices.length}
        getRowId={row => row.deviceId}
        disableRowSelectionOnClick
        disableColumnResize
        slots={{
          noRowsOverlay: () => (
            <Box>
              <Typography>No data available</Typography>
            </Box>
          ),
        }}
      />
    </div>
  )
}

export default Devices
