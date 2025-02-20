import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DeviceProvider } from './contexts/DeviceContext'
import Automation from './pages/Automation/Automation'
import Navbar from './components/Navbar/Navbar'
import { SnackbarProvider } from 'notistack'
import Devices from './pages/Devices/Devices'
import Device from './pages/Device/Device'
import Home from './pages/Home/Home'
import './App.scss'

// @ts-ignore - Import alias in vite.config
import 'bootstrap-icons'

function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <DeviceProvider>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/devices' element={<Devices />} />
            <Route path='/devices/:id' element={<Device />} />
            <Route path='/automation' element={<Automation />} />
          </Routes>
        </DeviceProvider>
      </SnackbarProvider>
    </BrowserRouter>
  )
}

export default App
