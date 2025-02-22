import { useLocation, useParams } from 'react-router-dom'
import { TDevice } from '../../types/deviceTypes'
import { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios'
import { API } from '../../utils'
import './Device.scss'

const Device = () => {
  const { id } = useParams()
  const location = useLocation()
  const deviceId = id ? parseInt(id, 10) : null
  const [device, setDevice] = useState<TDevice>()

  useEffect(() => {
    const cachedDevice = location.state?.device
    if (cachedDevice && cachedDevice.deviceId == deviceId) {
      setDevice(cachedDevice)
    } else {
      API.get('/devices/').then((response: AxiosResponse) => {
        response.data.forEach((currDevice: TDevice) => {
          if (currDevice.deviceId === deviceId) {
            setDevice(currDevice)
          }
        })
      })
    }
  }, [])

  return (
    <div className='device'>
      <h2>Device Details</h2>
      <p>Device ID: {id}</p>
      {device && <p>Name: {device?.name}</p>}
    </div>
  )
}

export default Device
