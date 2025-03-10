import { TDevice, TTag } from '../types/deviceTypes'
import { AxiosError, AxiosResponse } from 'axios'
import { useApi } from './ApiContext'
import {
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
} from 'react'

interface DeviceContextType {
  tags: TTag[]
  devices: TDevice[]
  devicesLoaded: boolean
  setTags: Dispatch<SetStateAction<TTag[]>>
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
  const [tags, setTagsList] = useState<TTag[]>([])
  const { API, isAuthenticated } = useApi()

  const fetchTags = async () => {
    if (isAuthenticated) {
      setIsLoading(true)
      await API.get('/tags/', 'Fetch all device tags request')
        .then((response: AxiosResponse) => {
          setTagsList(response.data)
        })
        .catch((err: AxiosError) => {
          console.error('GET request failed', err)
        })
    }
  }

  const fetchDevices = async () => {
    if (isAuthenticated)
      API.get('/devices/', 'Fetch all devices request')
        .then((response: AxiosResponse) => {
          setDevicesList(
            response.data.map((device: TDevice) => ({
              ...device,
              location: tags?.find(t => t.tagId === device.roomTag)?.name,
            }))
          )
        })
        .catch((err: AxiosError) => {
          console.error('GET request failed', err)
        })
        .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchTags()
  }, [isAuthenticated])

  useEffect(() => {
    if (tags && Array.isArray(tags)) fetchDevices()
  }, [tags])

  return (
    <DeviceContext.Provider
      value={{
        tags,
        devices,
        devicesLoaded: !isLoading,
        setDevices: setDevicesList,
        refreshDevices: fetchDevices,
        setTags: setTagsList,
      }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

export const useDevices = () => {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error(
      'Component calling useDevices should be within a <DeviceProvider>'
    )
  }
  return context
}
