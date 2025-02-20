import { TDevice } from '../types/deviceTypes'
import { enqueueSnackbar } from 'notistack'
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
  setDevices: Dispatch<SetStateAction<TDevice[]>>
  refreshDevices: () => void
}

export const DeviceContext = createContext<DeviceContextType | undefined>(
  undefined
)

// Context for devices
export const DeviceProvider = ({ children }: { children: React.ReactNode }) => {
  const [devices, setDevicesList] = useState<TDevice[]>([])

  const fetchDevices = async () => {
    API.get('/devices/')
      .then((response: any) => {
        setDevicesList(
          response.data.map((device: TDevice) => ({
            ...device,
            location: 'Kitchen',
          }))
        )
      })
      .catch((err: any) => {
        enqueueSnackbar(err.message, {
          variant: 'error',
          preventDuplicate: true,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        })
      })
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  return (
    <DeviceContext.Provider
      value={{
        devices,
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
