import { Routes, Route, useLocation } from 'react-router-dom'
import Automation from './pages/Automation/Automation'
import Navbar from './components/Navbar/Navbar'
import Devices from './pages/Devices/Devices'
import Device from './pages/Device/Device'
import Energy from './pages/Energy/Energy'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'

const AppRouter = () => {
  const location = useLocation()

  return (
    <>
      {location.pathname !== '/' && <Navbar />}

      <Routes>
        <Route path='/' element={<Login key='login' />} />

        <Route path='/local' element={<Home key={location.pathname} />} />
        <Route path='/local/energy' element={<Energy />} />
        <Route path='/local/devices' element={<Devices />} />
        <Route path='/local/devices/:id' element={<Device />} />
        <Route path='/local/automation' element={<Automation />} />

        <Route path='/remote' element={<Home key={location.pathname} />} />
        <Route path='/remote/energy' element={<Energy />} />
        <Route path='/remote/devices' element={<Devices />} />
        <Route path='/remote/devices/:id' element={<Device />} />
        <Route path='/remote/automation' element={<Automation />} />
      </Routes>
    </>
  )
}

export default AppRouter
