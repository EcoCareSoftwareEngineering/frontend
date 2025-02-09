import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Device, DeviceData } from '../../types/deviceTypes'
import { useEffect, useState } from 'react'
import API from '../../api'
import './Devices.scss'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Device', width: 150 },
  { field: 'location', headerName: 'Location', width: 150 },
  { field: 'powerOn', headerName: 'Status', width: 150 },
]

const Devices = () => {
  const [devices, setDevices] = useState<Device[]>()
  const [deviceData, setDeviceData] = useState<DeviceData[]>()

  useEffect(() => {
    API.get('/devices')
      .then((response: any) => {
        setDevices(response.data)
      })
      .catch(error => {
        console.error('Error fetching device data:', error)
      })
  }, [])

  useEffect(() => {
    setDeviceData(
      devices?.map((item, index) => ({
        id: index,
        name: item.name,
        location: 'Kitchen',
        powerOn: item.status === 'On',
      }))
    )
  }, [devices])

  return (
    <div className='devices'>
      {devices && <DataGrid rows={deviceData} columns={columns} />}
    </div>
  )
}

export default Devices
