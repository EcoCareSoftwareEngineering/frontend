import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid'
import { Device } from '../../types/deviceTypes'
import { useEffect, useState } from 'react'
import API from '../../api'
import './Devices.scss'

const rows: GridRowsProp = [
  { id: 1, col1: 'Hello', col2: 'World' },
  { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 3, col1: 'MUI', col2: 'is Amazing' },
]

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
]

const Devices = () => {
  const [data, setData] = useState<Device[]>()

  useEffect(() => {
    API.get('/devices')
      .then((response: any) => {
        setData(response.data)
      })
      .catch(error => {
        console.error('Error fetching device data:', error)
      })
  }, [])

  useEffect(() => {
    console.log(data)
  }, [data])

  return (
    <div className='devices'>
      <DataGrid rows={rows} columns={columns} />
    </div>
  )
}

export default Devices
