import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Devices from './pages/Devices/Devices'
import Device from './pages/Device/Device'
import Home from './pages/Home/Home'
import './App.css'

// @ts-ignore - Import alias in vite.config
import 'bootstrap-icons'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/devices' element={<Devices />} />
        <Route path='/devices/:id' element={<Device />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
