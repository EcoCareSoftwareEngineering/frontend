import { ValidApiError } from '../types/generalTypes'
import { enqueueSnackbar } from 'notistack'
import axios, { AxiosError } from 'axios'
import {
  SetStateAction,
  createContext,
  useContext,
  Dispatch,
  useState,
  useRef,
  useEffect,
} from 'react'

interface ApiWrapper {
  get: (
    url: string,
    requestDescription?: string,
    validCodes?: number[]
  ) => Promise<any>
  post: (
    url: string,
    data: any,
    requestDescription?: string,
    validCodes?: number[]
  ) => Promise<any>
  put: (
    url: string,
    data: any,
    requestDescription?: string,
    validCodes?: number[]
  ) => Promise<any>
  delete: (
    url: string,
    requestDescription?: string,
    validCodes?: number[]
  ) => Promise<any>
}

interface ApiContextType {
  API: ApiWrapper
  loading: boolean
  isAuthenticated: boolean
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>
  logout: () => void
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

const BASE_URL = 'http://127.0.0.1:5000/api'
// const BASE_URL = 'http://192.168.0.11:5000/api'

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const activeRequests = useRef(0)

  const logout = () => {
    localStorage.removeItem('token')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['token'] = token
      setIsAuthenticated(true)
    }
  }, [])

  const getIsAuthenticated = () => isAuthenticated

  const request = async (
    method: string,
    url: string,
    data?: any,
    requestDescription?: string,
    validStatusCodes?: number[],
    showCustomError?: boolean
  ) => {
    activeRequests.current++
    setLoading(true)

    try {
      // First check authentication status
      const timeout = 3000
      const startTime = Date.now()
      if (
        !url.includes('login') &&
        !url.includes('signup') &&
        !url.includes('unlock')
      )
        while (!getIsAuthenticated()) {
          if (Date.now() - startTime >= timeout) {
            throw new Error('Failed to load authentication token')
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      // Then make request with axios
      const response = await axios({
        method,
        url: `${BASE_URL}${url}`,
        data,
      })

      return response
    } catch (error: AxiosError | any) {
      if (
        validStatusCodes &&
        Array.isArray(validStatusCodes) &&
        validStatusCodes.length > 0 &&
        validStatusCodes.includes(error.status)
      ) {
        throw new ValidApiError('API call valid failure')
      }
      // Show snackbar if error
      enqueueSnackbar(
        `${requestDescription ?? ''} ${
          showCustomError ? error.response.data.Error : error.message
        }`,
        {
          preventDuplicate: true,
          variant: 'error',
          style: {
            maxWidth: '200px',
            textAlign: 'left',
            whiteSpace: 'pre-line',
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
        }
      )

      throw error
    } finally {
      activeRequests.current--
      if (activeRequests.current == 0) {
        setLoading(false)
      }
    }
  }

  const API: ApiWrapper = {
    get: (
      url: string,
      requestDescription?: string,
      validCodes?: number[],
      showCustomError?: boolean
    ) =>
      request(
        'GET',
        url,
        null,
        requestDescription,
        validCodes,
        showCustomError
      ),
    post: (
      url: string,
      data: any,
      requestDescription?: string,
      validCodes?: number[],
      showCustomError?: boolean
    ) =>
      request(
        'POST',
        url,
        data,
        requestDescription,
        validCodes,
        showCustomError
      ),
    put: (
      url: string,
      data: any,
      requestDescription?: string,
      validCodes?: number[],
      showCustomError?: boolean
    ) =>
      request(
        'PUT',
        url,
        data,
        requestDescription,
        validCodes,
        showCustomError
      ),
    delete: (
      url: string,
      requestDescription?: string,
      validCodes?: number[],
      showCustomError?: boolean
    ) =>
      request(
        'DELETE',
        url,
        null,
        requestDescription,
        validCodes,
        showCustomError
      ),
  }

  return (
    <ApiContext.Provider
      value={{
        API,
        loading,
        isAuthenticated,
        setIsAuthenticated,
        logout,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('Component calling useApi should be within a <ApiProvider>')
  }
  return context
}
