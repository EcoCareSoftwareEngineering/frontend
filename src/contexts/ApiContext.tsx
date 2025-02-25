import React, { createContext, useContext, useEffect, useState } from 'react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { TUserLogin } from '../types/generalTypes'
import { enqueueSnackbar } from 'notistack'

const ApiContext = createContext<any>(null)

const BASE_URL = 'http://localhost:5000/api'

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false)

  const TOUCHSCREEN_LOGIN = {
    username: 'touchscreen',
    password: 'touchscreenPassword',
  }

  const login = (loginDetails: TUserLogin) => {
    API.post('/accounts/login/', loginDetails).then((res: AxiosResponse) => {
      localStorage.setItem('token', res.data.token)
      axios.defaults.headers.common['token'] = res.data.token
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      login(TOUCHSCREEN_LOGIN)
    } else {
      axios.defaults.headers.common['token'] = localStorage.getItem('token')
    }
  }, [])

  const getAuthToken = () => localStorage.getItem('token')

  const request = async (
    method: string,
    url: string,
    data?: any,
    requestDescription?: string
  ) => {
    setLoading(true)

    try {
      const response = await axios({
        method,
        url: `${BASE_URL}${url}`,
        data,
        headers: {
          Authorization: `Bearer ${getAuthToken()}`, // Auto-add token
          'Content-Type': 'application/json',
        },
      })

      return response
    } catch (error: AxiosError | any) {
      enqueueSnackbar(`${requestDescription ?? ''} ${error.message}`, {
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
      setLoading(false)
    }
  }

  const API = {
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
    <ApiContext.Provider value={{ API, loading, login, logout }}>
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
