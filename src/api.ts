import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/'

const API = {
  get: (url: string) => {
    return axios.get(BASE_URL + url).then(response => response.data)
  },
  post: (url: string, postData: object) => {
    return axios.post(BASE_URL + url, postData).then(response => response.data)
  },
}

export default API
