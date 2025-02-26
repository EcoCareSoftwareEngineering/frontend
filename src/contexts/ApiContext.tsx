import { createContext, useContext, useEffect, useRef, useState } from 'react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { TUserLogin } from '../types/generalTypes'
import { enqueueSnackbar } from 'notistack'

interface ApiWrapper {
  get: (url: string, requestDescription?: string) => Promise<any>
  post: (url: string, data: any, requestDescription?: string) => Promise<any>
  put: (url: string, data: any, requestDescription?: string) => Promise<any>
  delete: (url: string, requestDescription?: string) => Promise<any>
}

interface ApiContextType {
  API: ApiWrapper
  loading: boolean
  isAuthenticated: boolean
  login: (loginDetails: TUserLogin) => void
  logout: () => void
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

const BASE_URL = 'http://localhost:5000/api'

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const activeRequests = useRef(0)

  const TOUCHSCREEN_LOGIN = {
    username: 'touchscreen',
    password: 'touchscreenPassword',
  }

  const login = (loginDetails: TUserLogin) => {
    API.post('/accounts/login/', loginDetails, 'User login request').then(
      (res: AxiosResponse) => {
        localStorage.setItem('token', res.data.token)
        axios.defaults.headers.common['token'] = res.data.token
        setIsAuthenticated(true)
      }
    )
  }

  const logout = () => {
    localStorage.removeItem('token')
  }

  const getAuthToken = () => localStorage.getItem('token')

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      login(TOUCHSCREEN_LOGIN)
    } else {
      axios.defaults.headers.common['token'] = token
      setIsAuthenticated(true)
    }
  }, [])

  const getIsAuthenticated = () => isAuthenticated

  const request = async (
    method: string,
    url: string,
    data?: any,
    requestDescription?: string
  ) => {
    activeRequests.current++
    setLoading(true)

    try {
      // First check authentication status
      const timeout = 3000
      const startTime = Date.now()
      while (!getIsAuthenticated() || url.includes('login')) {
        if (Date.now() - startTime >= timeout) {
          throw new Error('failed to load authentication token')
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
      // Show snackbar if error
      enqueueSnackbar(`${requestDescription ?? ''} ${error.message}`, {
        preventDuplicate: true,
        variant: 'error',
        style: {
          maxWidth: '200px',
          textAlign: 'left',
          whiteSpace: 'pre-line',
        },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      })

      throw error
    } finally {
      activeRequests.current--
      if (activeRequests.current == 0) {
        setLoading(false)
      }
    }
  }

  const API: ApiWrapper = {
    get: (url: string, requestDescription?: string) =>
      request('GET', url, null, requestDescription),
    post: (url: string, data: any, requestDescription?: string) =>
      request('POST', url, data, requestDescription),
    put: (url: string, data: any, requestDescription?: string) =>
      request('PUT', url, data, requestDescription),
    delete: (url: string, requestDescription?: string) =>
      request('DELETE', url, null, requestDescription),
  }

  return (
    <ApiContext.Provider
      value={{ API, loading, isAuthenticated, login, logout }}
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
