import axios from 'axios'

const BASE_URL = 'http://192.168.0.11:5000/api'

// API utility wrapper
export const API = {
  get: async (url: string) => {
    try {
      const response = await axios.get(BASE_URL + url)
      if (response.status >= 400)
        throw new Error(`HTTP Error: ${response.status}`)
      return response
    } catch (error) {
      console.error(`GET request to ${url} failed: ${error}`)
      throw error
    }
  },
  post: async (url: string, postData: object) => {
    try {
      const response = await axios.post(BASE_URL + url, postData)
      if (response.status >= 400)
        throw new Error(`HTTP Error: ${response.status}`)
      return response
    } catch (error) {
      console.error(`POST request to ${url} failed: ${error}`)
      throw error
    }
  },
  put: async (url: string, updateData: object) => {
    try {
      const response = await axios.put(BASE_URL + url, updateData)
      if (response.status >= 400)
        throw new Error(`HTTP Error: ${response.status}`)
      return response
    } catch (error) {
      console.error(`PUT request to ${url} failed: ${error}`)
      throw error
    }
  },
  delete: async (url: string) => {
    try {
      const response = await axios.delete(BASE_URL + url)
      if (response.status >= 400)
        throw new Error(`HTTP Error: ${response.status}`)
      return response
    } catch (error) {
      console.error(`DELETE request to ${url} failed: ${error}`)
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
