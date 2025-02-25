import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DeviceProvider } from './contexts/DeviceContext'
import Automation from './pages/Automation/Automation'
import { ApiProvider } from './contexts/ApiContext'
import Navbar from './components/Navbar/Navbar'
import Devices from './pages/Devices/Devices'
import { SnackbarProvider } from 'notistack'
import Energy from './pages/Energy/Energy'
import Device from './pages/Device/Device'
import Home from './pages/Home/Home'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'
import './App.scss'

// @ts-ignore - Import alias in vite.config
import 'bootstrap-icons'

dayjs.extend(utc)

function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider>
            <DeviceProvider>
              <Navbar />
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/energy' element={<Energy />} />
                <Route path='/devices' element={<Devices />} />
                <Route path='/devices/:id' element={<Device />} />
                <Route path='/automation' element={<Automation />} />
              </Routes>
            </DeviceProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ApiProvider>
    </BrowserRouter>
  )
}

export default App
