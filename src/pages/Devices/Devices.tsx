import DeleteDeviceModal from '../../components/DeviceModals/DeleteDeviceModal'
import EditDeviceModal from '../../components/DeviceModals/EditDeviceModal'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { getCSSVariable, getLinkTopLevel } from '../../utils'
import { useDevices } from '../../contexts/DeviceContext'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../contexts/ApiContext'
import { AxiosError, AxiosResponse } from 'axios'
import { TDevice } from '../../types/deviceTypes'
import { enqueueSnackbar } from 'notistack'
import './Devices.scss'
import {
  TableContainer,
  useMediaQuery,
  Typography,
  TextField,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  Tooltip,
  Button,
  Modal,
  Table,
  Paper,
  Radio,
  Box,
} from '@mui/material'

const Devices = () => {
  const [selectedDevice, setSelectedDevice] = useState<TDevice | null>(null)
  const { devices, devicesLoaded } = useDevices()
  const navigate = useNavigate()
  const { loading } = useApi()

  const offColor = getCSSVariable('--red-color')
  const onColor = getCSSVariable('--green-color')

  // DELETE device handlers
  const [showDelete, setShowDelete] = useState<boolean>(false)
  const setDeleteIsClosed = () => setShowDelete(false)
  const handleClickDelete = (row: TDevice) => {
    setSelectedDevice(row)
    setShowDelete(true)
  }

  // ADD device handlers
  const [addModalIsOpen, setAddModalIsOpen] = useState<boolean>(false)

  const handleAddModalClose = () => {
    setAddModalIsOpen(false)
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
          Connect Device
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
      <ConnectDeviceModal
        addModalIsOpen={addModalIsOpen}
        setAddModalIsOpen={setAddModalIsOpen}
        handleAddModalClose={handleAddModalClose}
      />
    </div>
  )
}

interface ConnectDeviceModal {
  addModalIsOpen: boolean
  handleAddModalClose: () => void
  setAddModalIsOpen: Dispatch<SetStateAction<boolean>>
}

const ConnectDeviceModal = ({
  addModalIsOpen,
  setAddModalIsOpen,
  handleAddModalClose,
}: ConnectDeviceModal) => {
  const [unconnectedDevices, setUnconnectedDevices] = useState<TDevice[]>([])
  const [ipAddress, setIpAddress] = useState<string>()
  const { devices, setDevices } = useDevices()
  const { API } = useApi()

  const handleRowClick = (row: any) => {
    setIpAddress(row.ipAddress)
  }

  useEffect(() => {
    if (addModalIsOpen)
      API.get('/devices/new/', 'Fetch un-connected devices request')
        .then((response: AxiosResponse) => {
          const data =
            response.data.length > 0
              ? response.data
              : [{ name: 'No un-connected devices found' }]
          setUnconnectedDevices(data)
        })
        .catch((err: AxiosError) => {
          console.error('GET request failed', err)
        })
  }, [addModalIsOpen])

  const addDevice = () => {
    API.post(
      '/devices/',
      { ipAddress: ipAddress },
      'Connect new device request\n'
    )
      .then((res: AxiosResponse) => {
        setDevices([
          ...devices,
          {
            ...res.data,
            customTags: res.data.customTags ?? [],
            userTags: res.data.userTags ?? [],
            roomTag: res.data.roomTag ?? undefined,
          },
        ])
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

  return (
    <Modal open={addModalIsOpen} onClose={handleAddModalClose}>
      <Box className='unconnected-devices-modal'>
        <Typography id='modal-modal-title' fontWeight='bold' variant='h5'>
          Connect a New Device
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Name</TableCell>
                <TableCell align='right'>Description</TableCell>
                <TableCell align='right'>IP Address</TableCell>
                <TableCell align='right'>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unconnectedDevices.map(row => (
                <TableRow
                  key={row.name}
                  onClick={() => handleRowClick(row)}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align='right'>
                    <Radio checked={ipAddress === row.ipAddress} />
                  </TableCell>
                  <TableCell component='th' scope='row'>
                    {row.name}
                  </TableCell>
                  <TableCell align='right'>{row.description}</TableCell>
                  <TableCell align='right'>{row.ipAddress}</TableCell>
                  <TableCell align='right'>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className='modal-table device-info'>
          <strong className='input-field-name'>IP Address:</strong>
          <strong className='input-field-name'>{ipAddress}</strong>
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
  )
}

export default Devices
