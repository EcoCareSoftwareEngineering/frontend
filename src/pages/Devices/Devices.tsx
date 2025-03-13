import DeleteDeviceModal from '../../components/DeleteDeviceModal/DeleteDeviceModal'
import EditDeviceModal from '../../components/EditDeviceModal/EditDeviceModal'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { getCSSVariable, getLinkTopLevel } from '../../utils'
import { useDevices } from '../../contexts/DeviceContext'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { TDevice } from '../../types/deviceTypes'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import './Devices.scss'
import {
  useMediaQuery,
  Typography,
  TextField,
  Tooltip,
  Button,
  Modal,
  Box,
} from '@mui/material'

const Devices = () => {
  const [selectedDevice, setSelectedDevice] = useState<TDevice | null>(null)
  const { devices, devicesLoaded, setDevices } = useDevices()
  const { API, loading } = useApi()
  const navigate = useNavigate()

  const offColor = getCSSVariable('--off-color')
  const onColor = getCSSVariable('--on-color')

  // DELETE device handlers
  const [showDelete, setShowDelete] = useState<boolean>(false)
  const setDeleteIsClosed = () => setShowDelete(false)
  const handleClickDelete = (row: TDevice) => {
    setSelectedDevice(row)
    setShowDelete(true)
  }

  // ADD device handlers
  const [addModalIsOpen, setAddModalIsOpen] = useState<boolean>(false)
  const [ipAddress, setIpAddress] = useState<string>('')

  const handleAddModalClose = () => {
    setAddModalIsOpen(false)
    setIpAddress('')
  }

  const handleChangeIp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpAddress(e.target.value)
  }

  const addDevice = () => {
    API.post(
      '/devices/',
      { ipAddress: ipAddress },
      'Connect new device request\n'
    )
      .then((response: AxiosResponse) => {
        setDevices([...devices, { ...response.data }])
        enqueueSnackbar('Successfully connected device', {
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
        setAddModalIsOpen(false)
        setIpAddress('')
      })
  }

  // UPDATE device handlers
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const handleClickEdit = (row: TDevice) => {
    setSelectedDevice(row)
    setShowEdit(true)
  }

  const handleRowClick = (params: any) => {
    navigate(`${getLinkTopLevel()}/devices/${params.row.deviceId}`)
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
          to={`${getLinkTopLevel()}/devices/${params.value}`}
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
          to={`${getLinkTopLevel()}/devices/${params.row.deviceId}`}
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
              <Button
                onClick={event => {
                  event.stopPropagation()
                  handleClickEdit(params.row)
                }}
              >
                <i className='bi bi-pencil' />
              </Button>
            </Tooltip>
            <Tooltip title='Delete device'>
              <Button
                onClick={event => {
                  event.stopPropagation()
                  handleClickDelete(params.row)
                }}
              >
                <i className='bi bi-trash' />
              </Button>
            </Tooltip>
          </div>
        )
      },
    },
  ].filter(Boolean) as GridColDef[]

  return (
    <div className='devices page-content'>
      <div className='page-header'>
        <h2 className='page-title'>All Devices</h2>
        <Button variant='contained' onClick={() => setAddModalIsOpen(true)}>
          <i className='bi bi-plus-lg' />
          Add Device
        </Button>
      </div>

      <LoadingModal open={!devicesLoaded || loading} />
      <DeleteDeviceModal
        showDelete={showDelete}
        selectedDevice={selectedDevice}
        setDeleteIsClosed={setDeleteIsClosed}
        setSelectedDevice={setSelectedDevice}
      />
      <EditDeviceModal
        showEdit={showEdit}
        selectedDevice={selectedDevice}
        setShowEdit={setShowEdit}
      />

      <DataGrid
        rows={devices}
        columns={columns}
        paginationMode='server'
        rowCount={devices.length}
        getRowId={row => row.deviceId}
        onRowClick={handleRowClick}
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
      <Modal open={addModalIsOpen} onClose={handleAddModalClose}>
        <Box>
          <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
            Add Energy Goal
          </Typography>
          <div className='modal-table device-info'>
            <strong className='input-field-name'>Name:</strong>
            <TextField
              size='small'
              name='name'
              value={ipAddress}
              placeholder='192.168.0.1'
              onChange={handleChangeIp}
            />
          </div>
          <div className='event-actions actions'>
            <Button className='cancel-btn' onClick={handleAddModalClose}>
              <i className='bi bi-x-lg' />
              Cancel
            </Button>
            <Button className='submit-btn' onClick={addDevice}>
              <i className='bi bi-floppy' />
              {addModalIsOpen ? 'Create' : 'Save'}
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default Devices
