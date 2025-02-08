import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api'

const API = {
  get: async (url: string) => {
    const response = await axios.get(BASE_URL + url)
    return response
  },
  post: async (url: string, postData: object) => {
    const response = axios.post(BASE_URL + url, postData)
    return response
  },
}

export default API
