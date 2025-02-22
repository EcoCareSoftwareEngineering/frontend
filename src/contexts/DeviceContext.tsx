import { TDevice } from '../types/deviceTypes'
import { AxiosResponse } from 'axios'
import { API } from '../utils'
import {
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
} from 'react'

interface DeviceContextType {
  devices: TDevice[]
  devicesLoaded: boolean
  setDevices: Dispatch<SetStateAction<TDevice[]>>
  refreshDevices: () => void
}

export const DeviceContext = createContext<DeviceContextType | undefined>(
  undefined
)

// Context for devices
export const DeviceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [devices, setDevicesList] = useState<TDevice[]>([])

  const fetchDevices = async () => {
    API.get('/devices/')
      .then((response: AxiosResponse) => {
        setDevicesList(
          response.data.map((device: TDevice) => ({
            ...device,
            location: 'Kitchen',
          }))
        )
      })
      .then(() => setIsLoading(false))
      .catch(err => console.error('GET request failed', err))
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  return (
    <DeviceContext.Provider
      value={{
        devices,
        devicesLoaded: !isLoading,
        setDevices: setDevicesList,
        refreshDevices: fetchDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

// Custom hook for using the context
export const useDevices = () => {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider')
  }
  return context
}
