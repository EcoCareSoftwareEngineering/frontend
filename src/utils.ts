import { enqueueSnackbar } from 'notistack'
import axios, { AxiosError } from 'axios'

const BASE_URL = 'http://localhost:5000/api'

// API utility wrapper
export const API = {
  get: async (url: string, requestDescription?: string) => {
    try {
      const response = await axios.get(BASE_URL + url)
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
    }
  },

  post: async (url: string, postData: any, requestDescription?: string) => {
    try {
      const response = await axios.post(BASE_URL + url, postData)
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
    }
  },

  put: async (url: string, updateData: any, requestDescription?: string) => {
    try {
      const response = await axios.put(BASE_URL + url, updateData)
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
    }
  },

  delete: async (url: string, requestDescription?: string) => {
    try {
      const response = await axios.delete(BASE_URL + url)
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
    }
  },
}

// Get SCSS variable by name
export const getCSSVariable = (variable: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}
