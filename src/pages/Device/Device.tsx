import { useLocation, useParams } from 'react-router-dom'
import { useDevices } from '../../contexts/DeviceContext'
import { TDevice } from '../../types/deviceTypes'
import { useEffect, useState } from 'react'
import './Device.scss'

const Device = () => {
  const { devices } = useDevices()
  const { id } = useParams()

  const [device, setDevice] = useState<TDevice>()
  const deviceId = id ? parseInt(id, 10) : null
  const location = useLocation()

  useEffect(() => {
    const cachedDevice = location.state?.device
    if (cachedDevice && cachedDevice.deviceId == deviceId) {
      setDevice(cachedDevice)
    } else {
      if (id)
        setDevice(
          devices.find(device => {
            device.deviceId === parseInt(id)
          })
        )
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
