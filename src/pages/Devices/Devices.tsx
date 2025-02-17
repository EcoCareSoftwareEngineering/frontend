import { Box, Typography, Modal, Button } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { API, getCSSVariable } from '../../utils'
import { Device } from '../../types/deviceTypes'
import { useEffect, useState } from 'react'
import './Devices.scss'

const Devices = () => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null)
  const [isLoading, setIsLoading] = useState<Boolean>(false)
  const [devices, setDevices] = useState<Device[]>()

  const onColor = getCSSVariable('--on-color')
  const offColor = getCSSVariable('--off-color')

  const [showDelete, setShowDelete] = useState<boolean>(false)
  const setDeleteIsClosed = () => setShowDelete(false)
  const handleClickDelete = (row: Device) => {
    setSelectedDevice(row)
    setShowDelete(true)
  }

  const deleteDevice = (deviceId?: number) => {
    setIsLoading(true)
    API.delete(`/devices/${deviceId}/`).then((response: any) => {
      if (response.status == 200) {
        setSelectedDevice(null)
        setDevices(devices?.filter(device => device.deviceId != deviceId))
        setDeleteIsClosed()
      }
    })
    setIsLoading(false)
  }

  const [showEdit, setShowEdit] = useState<boolean>(false)
  const setEditIsClosed = () => setShowEdit(false)
  const handleClickEdit = (row: Device) => {
    setSelectedDevice(row)
    setShowEdit(true)
  }

  const updateDevice = (deviceId: number, updatedDevice: Device) => {
    API.put(`/devices/${deviceId}/`, updatedDevice).then((response: any) => {
      if (response.status == 200) {
      }
    })
  }

  useEffect(() => {
    API.get('/devices/').then((response: any) => {
      setDevices(
        response.data.map((device: Device) => ({
          ...device,
          location: 'Kitchen',
        }))
      )
      console.log(devices)
    })
  }, [])

  const columns: GridColDef[] = [
    {
      field: 'deviceId',
      headerName: 'ID',
      width: 75,
      renderCell: params => (
        <div style={{ textIndent: '5px' }}>{params.value}</div>
      ),
    },
    { field: 'name', headerName: 'Device', width: 150 },
    { field: 'location', headerName: 'Location', width: 150 },
    {
      field: 'status',
      headerName: 'Power',
      width: 100,
      renderCell: params => (
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
      width: 100,
      renderCell: params => (
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
    {
      field: 'deviceActions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      disableColumnMenu: true,
      renderCell: params => {
        return (
          <div className='actions'>
            <div role='button' onClick={() => handleClickEdit(params.row)}>
              <i className='bi bi-pencil' />
            </div>
            <Modal
              open={showEdit}
              onClose={setEditIsClosed}
              aria-labelledby='modal-modal-title'
              aria-describedby='modal-modal-description'
            >
              <Box>
                <Typography id='modal-modal-title' variant='h6' component='h2'>
                  Edit Device Details:
                </Typography>
                <Typography id='modal-modal-description' sx={{ mt: 2 }}>
                  Duis mollis, est non commodo luctus, nisi erat porttitor
                  ligula.
                </Typography>
                <div className='actions'>
                  <Button className='cancel-btn' onClick={setEditIsClosed}>
                    <i className='bi bi-x-lg' />
                    Cancel
                  </Button>
                  <Button className='update-btn'>
                    <i className='bi bi-floppy' />
                    Save
                  </Button>
                </div>
              </Box>
            </Modal>
            <div role='button' onClick={() => handleClickDelete(params.row)}>
              <i className='bi bi-trash' />
            </div>
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
                <Typography id='modal-description' sx={{ mt: 2 }}>
                  <div className='device-info'>
                    <strong>Device ID:</strong> {selectedDevice?.deviceId}
                    <strong>Name:</strong> {selectedDevice?.name}
                    <strong>Description:</strong> {selectedDevice?.description}
                    <strong>IP Address:</strong> {selectedDevice?.ipAddress}
                    <strong>Location:</strong> {selectedDevice?.location}
                  </div>
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
  ]

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
        />
      )}
    </div>
  )
}

export default Devices
